import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../server.js";

describe("Observability & Telemetry (Integration)", () => {
  describe("Correlation ID Middleware", () => {
    it("generates and attaches an X-Request-Id header when none is provided", async () => {
      const res = await request(app).get("/api/health").expect(200);

      const reqId = res.headers["x-request-id"];
      expect(reqId).toBeDefined();
      expect(reqId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("propagates an incoming X-Request-Id header across the lifecycle", async () => {
      const customId = "trace-test-uuid-999";
      const res = await request(app)
        .get("/api/health")
        .set("X-Request-Id", customId)
        .expect(200);

      expect(res.headers["x-request-id"]).toBe(customId);
    });
  });

  describe("Health & Readiness Probes (/api/health)", () => {
    it("GET /api/health returns basic operational status", async () => {
      const res = await request(app).get("/api/health").expect(200);

      expect(res.body.ok).toBe(true);
      expect(res.body.service).toBe("invoice-manager-api");
      expect(res.body.timestamp).toBeDefined();
    });

    it("GET /api/health/live returns process uptime and memory telemetry", async () => {
      const res = await request(app).get("/api/health/live").expect(200);

      expect(res.body.status).toBe("alive");
      expect(typeof res.body.uptimeSeconds).toBe("number");
      expect(typeof res.body.memoryUsageMb).toBe("number");
      expect(res.body.timestamp).toBeDefined();
    });

    it("GET /api/health/ready returns readiness with active database check", async () => {
      const res = await request(app).get("/api/health/ready").expect(200);

      expect(res.body.status).toBe("ready");
      expect(res.body.checks.database).toBe("connected");
      expect(typeof res.body.checks.uptimeSeconds).toBe("number");
    });
  });

  describe("Prometheus Metrics Endpoint (/api/metrics)", () => {
    it("exposes Prometheus text format metrics with RED and custom domain counters", async () => {
      // Trigger an HTTP request first so metrics exist
      await request(app).get("/api/health").expect(200);

      const res = await request(app)
        .get("/api/metrics")
        .expect(200);

      expect(res.headers["content-type"]).toMatch(/text\/plain/);

      const text = res.text;
      // Default runtime metrics
      expect(text).toContain("invoice_manager_process_cpu_seconds_total");
      expect(text).toContain("invoice_manager_nodejs_heap_size_used_bytes");

      // RED HTTP metrics
      expect(text).toContain("invoice_manager_http_requests_total");
      expect(text).toContain("invoice_manager_http_request_duration_seconds");

      // Business domain metrics
      expect(text).toContain("invoice_manager_invoices_created_total");
      expect(text).toContain("invoice_manager_pdf_generation_duration_seconds");
    });
  });
});
