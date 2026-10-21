import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";

describe("Invoices & Clients API (Integration)", () => {
  let userCookie;
  let clientId;

  beforeEach(async () => {
    // Register business user
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Enterprise Admin",
        businessName: "Acme Corp",
        email: "admin@acmecorp.com",
        password: "secretpassword123",
      })
      .expect(201);

    userCookie = regRes.headers["set-cookie"];

    // Create client
    const clientRes = await request(app)
      .post("/api/clients")
      .set("Cookie", userCookie)
      .send({
        name: "Stark Industries",
        company: "Stark Ind",
        email: "tony@stark.com",
        password: "clientpassword123",
        phone: "1234567890",
        address: "10880 Malibu Point, Malibu, CA",
      })
      .expect(201);

    clientId = clientRes.body.client._id;
  });

  it("creates a draft invoice with auto-generated sequence number and computed totals", async () => {
    const payload = {
      client: clientId,
      issueDate: "2026-01-10",
      dueDate: "2026-01-25",
      notes: "Thanks for doing business!",
      items: [
        {
          description: "Arc Reactor Maintenance",
          quantity: 2,
          unitPrice: 5000,
          taxRate: 18,
        },
        {
          description: "Nano-suit calibration",
          quantity: 1,
          unitPrice: 2000,
          taxRate: 10,
        },
      ],
    };

    const res = await request(app)
      .post("/api/invoices")
      .set("Cookie", userCookie)
      .send(payload)
      .expect(201);

    const invoice = res.body.item;
    expect(invoice.number).toBe("INV-0001");
    expect(invoice.status).toBe("draft");
    expect(invoice.client._id).toBe(clientId);

    expect(invoice.subtotal).toBe(12000);
    expect(invoice.taxTotal).toBe(2000);
    expect(invoice.total).toBe(14000);
    expect(invoice.amountPaid).toBe(0);
  });

  it("transitions invoice from draft to sent via /:id/send", async () => {
    const createRes = await request(app)
      .post("/api/invoices")
      .set("Cookie", userCookie)
      .send({
        client: clientId,
        issueDate: "2026-01-10",
        dueDate: "2026-01-25",
        items: [{ description: "Consulting", quantity: 1, unitPrice: 1000 }],
      })
      .expect(201);

    const invoiceId = createRes.body.item._id;

    const sendRes = await request(app)
      .post(`/api/invoices/${invoiceId}/send`)
      .set("Cookie", userCookie)
      .expect(200);

    expect(sendRes.body.item.status).toBe("sent");

    const resend = await request(app)
      .post(`/api/invoices/${invoiceId}/send`)
      .set("Cookie", userCookie)
      .expect(400);

    expect(resend.body.message).toMatch(/only draft invoices can be sent/i);
  });

  it("streams invoice as PDF with correct content-type header", async () => {
    const createRes = await request(app)
      .post("/api/invoices")
      .set("Cookie", userCookie)
      .send({
        client: clientId,
        issueDate: "2026-01-10",
        dueDate: "2026-01-25",
        items: [{ description: "Product shipment", quantity: 3, unitPrice: 200 }],
      })
      .expect(201);

    const invoiceId = createRes.body.item._id;

    const res = await request(app)
      .get(`/api/invoices/${invoiceId}/pdf`)
      .set("Cookie", userCookie)
      .expect(200);

    expect(res.headers["content-type"]).toBe("application/pdf");
  });

  it("prevents unauthorized users from accessing or modifying another tenant's invoices", async () => {
    const createRes = await request(app)
      .post("/api/invoices")
      .set("Cookie", userCookie)
      .send({
        client: clientId,
        issueDate: "2026-01-10",
        dueDate: "2026-01-25",
        items: [{ description: "Confidential Project", quantity: 1, unitPrice: 500 }],
      })
      .expect(201);

    const invoiceId = createRes.body.item._id;

    const otherUserRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Second User",
        businessName: "Competitor Inc",
        email: "other@competitor.com",
        password: "secretpassword123",
      })
      .expect(201);

    const otherCookie = otherUserRes.headers["set-cookie"];

    await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set("Cookie", otherCookie)
      .expect(404);

    await request(app)
      .post(`/api/invoices/${invoiceId}/send`)
      .set("Cookie", otherCookie)
      .expect(404);
  });
});
