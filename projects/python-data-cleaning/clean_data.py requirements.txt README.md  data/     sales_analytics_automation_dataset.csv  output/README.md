# Python Data Cleaning & Quality Automation

**Portfolio Project #02 — Gautam | Data Analyst**

A reproducible Python workflow that takes the portfolio's 3,000-row sales dataset, performs data-quality checks, standardizes fields, validates business rules, creates analysis-ready columns, and exports audit outputs.

## Dataset

The source dataset contains 3,000 sales/order records and 20 source columns covering order dates, customers, products, pricing, revenue, cost, profit, channels, payment methods and order status. The business statuses are Delivered, Returned and Cancelled. fileciteturn20file0L12-L16

The dataset is a **simulated e-commerce dataset for portfolio demonstration**.

## What the project demonstrates

- CSV ingestion and schema checks
- Text and datatype standardization
- Duplicate detection/removal
- Missing-value handling
- Date parsing
- Numeric validation
- Business-rule validation
- Derived analytical columns
- Anomaly flagging without overwriting valid business economics
- Automated quality and summary reports

## Run locally

```bash
pip install -r requirements.txt

python clean_data.py   --input data/sales_analytics_automation_dataset.csv   --output output
```

## Outputs

- `clean_sales_data.csv` — analysis-ready dataset
- `quality_report.csv` — data-quality checks
- `anomaly_report.csv` — rows requiring review
- `summary.json` — machine-readable project summary

## Business outcome

The workflow is designed as a reusable quality gate before SQL, Power BI or reporting work. It also keeps the source financial values intact and uses explicit flags when a business-rule review is needed.

## Suggested portfolio story

**Problem → Profile → Clean → Validate → Enrich → Audit → Ready for BI**

