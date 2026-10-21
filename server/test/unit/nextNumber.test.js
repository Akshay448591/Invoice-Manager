import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import nextNumber from "../../utils/nextNumber.js";
import Counter from "../../models/Counter.js";

describe("nextNumber Generator (Unit)", () => {
  it("generates sequential formatted document numbers starting from 0001", async () => {
    const ownerId = new mongoose.Types.ObjectId();
    const num1 = await nextNumber(ownerId, "invoice", "INV");
    expect(num1).toBe("INV-0001");

    const num2 = await nextNumber(ownerId, "invoice", "INV");
    expect(num2).toBe("INV-0002");

    const num3 = await nextNumber(ownerId, "invoice", "INV");
    expect(num3).toBe("INV-0003");
  });

  it("isolates sequences by document key", async () => {
    const ownerId = new mongoose.Types.ObjectId();
    const inv1 = await nextNumber(ownerId, "invoice", "INV");
    const quo1 = await nextNumber(ownerId, "quote", "QUO");

    expect(inv1).toBe("INV-0001");
    expect(quo1).toBe("QUO-0001");
  });

  it("isolates sequences by owner", async () => {
    const ownerA = new mongoose.Types.ObjectId();
    const ownerB = new mongoose.Types.ObjectId();

    const numA = await nextNumber(ownerA, "invoice", "INV");
    const numB = await nextNumber(ownerB, "invoice", "INV");

    expect(numA).toBe("INV-0001");
    expect(numB).toBe("INV-0001");
  });
});
