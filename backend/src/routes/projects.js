import { Router } from "express";

const router = Router();

const projects = [
  {
    id: "sales-analytics-automation",
    number: "01",
    title: "Sales Analytics & Automation System",
    status: "LIVE",
    type: "SQL • DASHBOARD • AUTOMATION",
    skills: ["PostgreSQL", "SQL", "Excel", "Google Sheets", "Apps Script"],
    description:
      "End-to-end simulated e-commerce analytics project with SQL analysis, dashboarding and automated reporting.",
    dashboard:
      "https://docs.google.com/spreadsheets/d/1LSBwi-Up503sTW-ACgDT7O3uTLTWZXlnKxnTLOVmsIA/edit?usp=sharing",
    github:
      "https://github.com/samdhiyagautam/sales-analytics-automation",
    metrics: [
      ["RECORDS", "3,000+"],
      ["REVENUE", "₹5.16Cr"],
      ["MARGIN", "32.2%"],
      ["AOV", "₹25.8K"]
    ]
  },
 {
  id: "python-data-cleaning",
  number: "02",
  title: "Python Data Cleaning & Automation",
  status: "LIVE",
  type: "PYTHON • PANDAS • AUTOMATION",
  skills: ["Python", "Pandas", "Data Cleaning", "Automation"],
  description:
    "Reusable data-cleaning and quality-check workflow for messy CSV and Excel data.",
  github:
    "https://github.com/samdhiyagautam/gautam-data-analyst-portfolio/tree/main/projects/python-data-cleaning"
},
  {
    id: "power-bi-dashboard",
    number: "03",
    title: "Power BI Business Dashboard",
    status: "COMING SOON",
    type: "POWER BI • DAX • MODELING",
    skills: ["Power BI", "DAX", "Data Modeling", "KPI Design"],
    description:
      "Interactive executive dashboard with KPIs, trends, profitability and drill-down analysis."
  },
  {
    id: "looker-studio",
    number: "04",
    title: "Looker Studio Analytics",
    status: "COMING SOON",
    type: "LOOKER STUDIO • REPORTING",
    skills: ["Looker Studio", "Reporting", "Visualization"],
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
