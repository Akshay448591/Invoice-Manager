// OpenTelemetry Tracing Initialization
// Must be initialized before requiring other modules when tracing is enabled
const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const { logger } = require("./utils/logger");

let sdk = null;

if (process.env.ENABLE_TRACING === "true") {
  sdk = new NodeSDK({
    serviceName: "invoice-manager-api",
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": {
          enabled: false, // disable noisy filesystem tracing
        },
      }),
    ],
  });

  try {
    sdk.start();
    logger.info("OpenTelemetry SDK tracing initialized successfully");
  } catch (err) {
    logger.error({ err }, "Error starting OpenTelemetry SDK");
  }

  process.on("SIGTERM", () => {
    sdk
      ?.shutdown()
      .then(() => logger.info("OpenTelemetry SDK shut down"))
      .catch((err) => logger.error({ err }, "Error shutting down OpenTelemetry SDK"));
  });
}

module.exports = sdk;
