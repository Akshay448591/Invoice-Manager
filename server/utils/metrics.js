const client = require("prom-client");

// Create custom Prometheus Registry
const register = new client.Registry();

// Add default process & NodeJS runtime metrics (CPU, Heap, GC, Event Loop)
client.collectDefaultMetrics({
  register,
  prefix: "invoice_manager_",
});

// HTTP Requests Counter
const httpRequestsTotal = new client.Counter({
  name: "invoice_manager_http_requests_total",
  help: "Total number of HTTP requests processed",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// HTTP Request Duration Histogram (RED Method: Duration)
const httpRequestDurationSeconds = new client.Histogram({
  name: "invoice_manager_http_request_duration_seconds",
  help: "Histogram of HTTP response latencies in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// Custom Domain Business Metric: Invoices Created
const invoicesCreatedTotal = new client.Counter({
  name: "invoice_manager_invoices_created_total",
  help: "Total count of invoices generated in the system",
  labelNames: ["status"],
  registers: [register],
});

// Custom Domain Business Metric: Payments Processed Amount
const paymentsAmountTotal = new client.Counter({
  name: "invoice_manager_payments_amount_total",
  help: "Cumulative sum of payments recorded across all invoices in currency units",
  registers: [register],
});

// Custom Domain Metric: PDF Generation Duration
const pdfGenerationDurationSeconds = new client.Histogram({
  name: "invoice_manager_pdf_generation_duration_seconds",
  help: "Time spent rendering vector PDFs via PDFKit",
  labelNames: ["document_type"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

// Middleware to automatically capture HTTP request duration & counts
const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    // Normalize route pattern to avoid high cardinality (e.g. /api/invoices/123 -> /api/invoices/:id)
    const route = req.baseUrl || req.path || "unknown";
    const labels = {
      method: req.method,
      route: route.replace(/[0-9a-fA-F]{24}/g, ":id"),
      status_code: res.statusCode,
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationInSeconds);
  });

  next();
};

// Handler for the /api/metrics endpoint
const metricsHandler = async (req, res) => {
  try {
    res.setHeader("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  invoicesCreatedTotal,
  paymentsAmountTotal,
  pdfGenerationDurationSeconds,
  metricsMiddleware,
  metricsHandler,
};
