"""
Python Data Cleaning & Quality Automation
Portfolio project for Gautam — Data Analyst

Usage:
    python clean_data.py \
        --input data/sales_analytics_automation_dataset.csv \
        --output output
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List

import pandas as pd


EXPECTED_STATUS = {"Delivered", "Returned", "Cancelled"}

REQUIRED_COLUMNS = [
    "order_id",
    "order_date",
    "customer_id",
    "city",
    "state",
    "customer_segment",
    "product_id",
    "product_name",
    "category",
    "quantity",
    "list_price",
    "discount_pct",
    "unit_price",
    "shipping_fee",
    "revenue",
    "cost",
    "profit",
    "sales_channel",
    "payment_method",
    "order_status",
]

NUMERIC_COLUMNS = [
    "quantity",
    "list_price",
    "discount_pct",
    "unit_price",
    "shipping_fee",
    "revenue",
    "cost",
    "profit",
]

TEXT_COLUMNS = [
    "order_id",
    "customer_id",
    "city",
    "state",
    "customer_segment",
    "product_id",
    "product_name",
    "category",
    "sales_channel",
    "payment_method",
    "order_status",
]


def clean_text(value: object) -> object:
    if pd.isna(value):
        return value
    return " ".join(str(value).strip().split())


def build_quality_report(df: pd.DataFrame, duplicate_rows_removed: int,
                         duplicate_orders_removed: int) -> pd.DataFrame:
    checks: List[Dict[str, object]] = []

    checks.append({
        "check": "row_count",
        "result": int(len(df)),
        "status": "PASS" if len(df) > 0 else "FAIL",
        "details": "Rows after cleaning"
    })

    checks.append({
        "check": "required_columns",
        "result": int(sum(col in df.columns for col in REQUIRED_COLUMNS)),
        "status": "PASS" if all(col in df.columns for col in REQUIRED_COLUMNS) else "FAIL",
        "details": "Expected columns present"
    })

    missing_total = int(df.isna().sum().sum())
    checks.append({
        "check": "missing_values",
        "result": missing_total,
        "status": "PASS" if missing_total == 0 else "REVIEW",
        "details": "Total missing cells after cleaning"
    })

    invalid_status = int((~df["order_status"].isin(EXPECTED_STATUS)).sum())
    checks.append({
        "check": "valid_order_status",
        "result": invalid_status,
        "status": "PASS" if invalid_status == 0 else "FAIL",
        "details": "Rows with unsupported status values"
    })

    bad_dates = int(df["order_date"].isna().sum())
    checks.append({
        "check": "valid_order_dates",
        "result": bad_dates,
        "status": "PASS" if bad_dates == 0 else "FAIL",
        "details": "Rows with invalid dates"
    })

    negative_numeric = int((df[NUMERIC_COLUMNS] < 0).sum().sum())
    checks.append({
        "check": "negative_numeric_values",
        "result": negative_numeric,
        "status": "PASS" if negative_numeric == 0 else "REVIEW",
        "details": "Negative values across numeric fields"
    })

    checks.append({
        "check": "exact_duplicate_rows_removed",
        "result": duplicate_rows_removed,
        "status": "INFO",
        "details": "Exact duplicate rows removed"
    })

    checks.append({
        "check": "duplicate_order_ids_removed",
        "result": duplicate_orders_removed,
        "status": "INFO",
        "details": "Duplicate order IDs removed"
    })

    cancelled_financial = int(
        (df["order_status"].eq("Cancelled") &
         (df["revenue"] != 0) &
         (df["cost"] != 0)).sum()
    )
    checks.append({
        "check": "cancelled_financial_zero",
        "result": cancelled_financial,
        "status": "PASS" if cancelled_financial == 0 else "REVIEW",
        "details": "Cancelled rows expected to have zero revenue/cost"
    })

    # A returned order can legitimately carry financial values, so this is not
    # treated as a generic anomaly.
    delivered_financial = int(
        (df["order_status"].eq("Delivered") &
         ((df["revenue"] <= 0) | (df["cost"] <= 0))).sum()
    )
    checks.append({
        "check": "delivered_financial_positive",
        "result": delivered_financial,
        "status": "PASS" if delivered_financial == 0 else "REVIEW",
        "details": "Delivered rows expected to have positive revenue/cost"
    })

    return pd.DataFrame(checks)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", default="output")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(input_path)

    original_rows = len(df)

    # Standardize headers.
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
    )

    # Standardize text fields.
    for col in TEXT_COLUMNS:
        if col in df.columns:
            df[col] = df[col].map(clean_text)

    # Parse dates.
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")

    # Coerce numeric fields.
    for col in NUMERIC_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Remove exact duplicate rows.
    before = len(df)
    df = df.drop_duplicates().copy()
    duplicate_rows_removed = before - len(df)

    # Remove duplicated order IDs while retaining the first occurrence.
    before = len(df)
    df = df.drop_duplicates(subset=["order_id"], keep="first").copy()
    duplicate_orders_removed = before - len(df)

    # Fill text missing values with a transparent placeholder.
    for col in TEXT_COLUMNS:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown")

    # Fill numeric missing values with median only after identifying them.
    for col in NUMERIC_COLUMNS:
        if df[col].isna().any():
            df[col] = df[col].fillna(df[col].median())

    # Re-parse dates after cleaning.
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")

    # Derived analysis columns.
    df["month"] = df["order_date"].dt.to_period("M").astype(str)
    df["discount_amount"] = (
        (df["list_price"] - df["unit_price"]) * df["quantity"]
    ).round(2)
    df["gross_sales"] = (
        df["unit_price"] * df["quantity"]
    ).round(2)
    df["calculated_margin_pct"] = (
        (df["profit"] / df["revenue"].replace(0, pd.NA)) * 100
    ).round(2)

    # Rule-based anomaly flags. We preserve original business economics.
    df["cancelled_financial_flag"] = (
        df["order_status"].eq("Cancelled") &
        ((df["revenue"] != 0) | (df["cost"] != 0) | (df["profit"] != 0))
    )

    df["delivered_financial_flag"] = (
        df["order_status"].eq("Delivered") &
        ((df["revenue"] <= 0) | (df["cost"] <= 0))
    )

    df["discount_flag"] = (
        (df["discount_pct"] < 0) | (df["discount_pct"] > 1)
    )

    df["data_quality_flag"] = (
        df["cancelled_financial_flag"] |
        df["delivered_financial_flag"] |
        df["discount_flag"] |
        df["order_date"].isna()
    )

    # Export clean data and audit report.
    clean_file = output_path / "clean_sales_data.csv"
    df.to_csv(clean_file, index=False)

    quality = build_quality_report(
        df,
        duplicate_rows_removed,
        duplicate_orders_removed,
    )
    quality.to_csv(output_path / "quality_report.csv", index=False)

    anomalies = df.loc[
        df["data_quality_flag"],
        [
            "order_id", "order_date", "order_status", "revenue", "cost", "profit",
            "discount_pct", "cancelled_financial_flag",
            "delivered_financial_flag", "discount_flag",
        ],
    ].copy()
    anomalies.to_csv(output_path / "anomaly_report.csv", index=False)

    summary = {
        "input_file": str(input_path),
        "original_rows": original_rows,
        "clean_rows": int(len(df)),
        "columns": int(len(df.columns)),
        "status_counts": df["order_status"].value_counts().to_dict(),
        "api_ready": True,
        "anomaly_rows": int(len(anomalies)),
        "revenue_total": round(float(df["revenue"].sum()), 2),
        "profit_total": round(float(df["profit"].sum()), 2),
        "profit_margin_pct": round(
            float(df["profit"].sum() / df["revenue"].sum() * 100), 2
        ) if df["revenue"].sum() else None,
    }

    with open(output_path / "summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
