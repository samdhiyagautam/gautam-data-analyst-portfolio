import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import projectRoutes from "./routes/projects.js";
import contactRoutes from "./routes/contact.js";

const app = express();

const PORT = Number(process.env.PORT || 5000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Gautam Portfolio API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(
    `Gautam Portfolio API running on http://localhost:${PORT}`
  );
});
