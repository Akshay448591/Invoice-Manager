const pino = require("pino");
const pinoHttp = require("pino-http");
const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const pinoConfig = {
  level: process.env.LOG_LEVEL || (isTest ? "silent" : "info"),
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
};

// Use pretty printing only in non-production, non-test environments
if (!isProduction && !isTest) {
  try {
    pinoConfig.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    };
  } catch {
    // Fall back to standard JSON if pino-pretty is unavailable
  }
}

const logger = pino(pinoConfig);

// HTTP Logging middleware with correlation ID injection
const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID(),
  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} ${res.statusCode} - ${res.getHeader("x-request-id") || req.id}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} ${res.statusCode} - Error: ${err.message}`,
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "durationMs",
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

// Middleware to ensure X-Request-Id header is echoed back on every response
const correlationIdMiddleware = (req, res, next) => {
  const reqId = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader("X-Request-Id", reqId);
  next();
};

module.exports = {
  logger,
  httpLogger,
  correlationIdMiddleware,
};
