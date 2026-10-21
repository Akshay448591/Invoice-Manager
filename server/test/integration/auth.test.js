import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../server.js";
import User from "../../models/User.js";

describe("Authentication API (Integration)", () => {
  const testUser = {
    name: "Alex Morgan",
    businessName: "Morgan Creative",
    email: "alex@example.com",
    password: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("registers a new business user, hashes password, and sets auth cookie", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser)
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.role).toBe("business");
      expect(res.body.user.password).toBeUndefined();

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);

      const savedUser = await User.findOne({ email: testUser.email }).select("+password");
      expect(savedUser).not.toBeNull();
      expect(savedUser.password).not.toBe(testUser.password);
      expect(await savedUser.matchPassword(testUser.password)).toBe(true);
    });

    it("rejects registration when email is already taken", async () => {
      await request(app).post("/api/auth/register").send(testUser).expect(201);

      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser)
        .expect(409);

      expect(res.body.message).toMatch(/already exists/i);
    });

    it("rejects registration when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "incomplete@example.com" })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    it("successfully logs in with valid credentials and sets token cookie", async () => {
      await request(app).post("/api/auth/register").send(testUser).expect(201);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);

      const cookies = res.headers["set-cookie"];
      expect(cookies[0]).toMatch(/token=/);
    });

    it("rejects login with incorrect password", async () => {
      await request(app).post("/api/auth/register").send(testUser).expect(201);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "wrongpassword" })
        .expect(401);

      expect(res.body.message).toMatch(/incorrect email or password/i);
    });

    it("rejects login when email is not found", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" })
        .expect(401);

      expect(res.body.message).toMatch(/incorrect email or password/i);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns authenticated user details when valid cookie is provided", async () => {
      const regRes = await request(app)
        .post("/api/auth/register")
        .send(testUser)
        .expect(201);

      const cookie = regRes.headers["set-cookie"];

      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookie)
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("returns 401 unauthorized when cookie is missing", async () => {
      const res = await request(app).get("/api/auth/me").expect(401);
      expect(res.body.message).toMatch(/not logged in/i);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("clears the session cookie on logout", async () => {
      const res = await request(app).post("/api/auth/logout").expect(200);
      expect(res.body.message).toBe("Logged out");

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/);
    });
  });
});
