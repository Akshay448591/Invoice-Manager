const router = require("express").Router();
const mongoose = require("mongoose");

// Basic health check (compatible with Render / load balancers)
router.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "invoice-manager-api",
    timestamp: new Date().toISOString(),
  });
});

// Liveness probe: verifies process is responsive and not deadlocked
router.get("/live", (req, res) => {
  res.json({
    status: "alive",
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe: verifies critical dependencies (MongoDB) are connected
router.get("/ready", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  const checks = {
    database: isDbConnected ? "connected" : "disconnected",
    uptimeSeconds: Math.floor(process.uptime()),
  };

  if (!isDbConnected) {
    return res.status(503).json({
      status: "unready",
      message: "Database connection is not ready",
      checks,
    });
  }

  res.json({
    status: "ready",
    checks,
    timestamp: new Date().toISOString(),
  });
});

// Frontend error ingestion endpoint for client-side crash telemetry
router.post("/telemetry/errors", (req, res) => {
  const { error, info, url } = req.body || {};
  const { logger } = require("../utils/logger");
  logger.warn(
    { clientError: error, componentStack: info, clientUrl: url },
    "Client-side frontend exception reported by ErrorBoundary",
  );
  res.status(202).json({ received: true });
});

module.exports = router;
