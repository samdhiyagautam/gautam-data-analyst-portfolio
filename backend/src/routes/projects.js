import { Router } from "express";

const router = Router();

const projects = [
  {
    id: "sales-analytics-automation",
    title: "Sales Analytics & Automation System",
    status: "LIVE",
    stack: [
      "PostgreSQL",
      "SQL",
      "Excel",
      "Google Sheets",
      "Apps Script"
    ],
    description:
      "End-to-end simulated e-commerce analytics project with SQL analysis, dashboarding and automated reporting.",
    links: {
      dashboard:
        "https://docs.google.com/spreadsheets/d/1LSBwi-Up503sTW-ACgDT7O3uTLTWZXlnKxnTLOVmsIA/edit?usp=sharing",
      github:
        "https://github.com/samdhiyagautam/sales-analytics-automation"
    }
  },
  {
    id: "python-data-cleaning",
    title: "Python Data Cleaning & Automation",
    status: "COMING SOON",
    stack: ["Python", "Pandas", "Automation"],
    description:
      "Reusable data-cleaning and quality-check workflow for messy CSV and Excel data."
  },
  {
    id: "power-bi-dashboard",
    title: "Power BI Business Dashboard",
    status: "COMING SOON",
    stack: ["Power BI", "DAX", "Data Modeling"],
    description:
      "Interactive executive dashboard with KPIs, trends, profitability and drill-down analysis."
  },
  {
    id: "looker-studio",
    title: "Looker Studio Analytics",
    status: "COMING SOON",
    stack: ["Looker Studio", "Reporting", "Visualization"],
    description:
      "Interactive browser-based analytics report with scorecards, filters and business storytelling."
  }
];

router.get("/", (_req, res) => {
  res.json({
    count: projects.length,
    projects
  });
});

router.get("/:id", (req, res) => {
  const project = projects.find(
    (item) => item.id === req.params.id
  );

  if (!project) {
    return res.status(404).json({
      error: "Project not found"
    });
  }

  return res.json(project);
});

export default router;
