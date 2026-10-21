import { describe, it, expect } from "vitest";
import lineItemsModule from "../../models/lineItems.js";
const { calcTotals, round } = lineItemsModule;

describe("Line Items Calculation Logic (Unit)", () => {
  describe("round()", () => {
    it("rounds numbers accurately to 2 decimal places", () => {
      expect(round(10.555)).toBe(10.56);
      expect(round(10.554)).toBe(10.55);
      expect(round(0)).toBe(0);
      expect(round(100)).toBe(100);
    });
  });

  describe("calcTotals()", () => {
    it("returns zero totals when items array is empty", () => {
      const res = calcTotals([]);
      expect(res).toEqual({ subtotal: 0, taxTotal: 0, total: 0 });
    });

    it("handles undefined items parameter gracefully", () => {
      const res = calcTotals();
      expect(res).toEqual({ subtotal: 0, taxTotal: 0, total: 0 });
    });

    it("calculates subtotal and total correctly with 0% tax", () => {
      const items = [
        { description: "Consulting", quantity: 5, unitPrice: 100, taxRate: 0 },
        { description: "Design", quantity: 2, unitPrice: 250, taxRate: 0 },
      ];
      const res = calcTotals(items);
      expect(res.subtotal).toBe(1000);
      expect(res.taxTotal).toBe(0);
      expect(res.total).toBe(1000);
    });

    it("calculates taxes properly with percentages and rounding", () => {
      const items = [
        { description: "Item 1", quantity: 1, unitPrice: 100, taxRate: 18 },
        { description: "Item 2", quantity: 3, unitPrice: 33.33, taxRate: 5 },
      ];
      const res = calcTotals(items);
      expect(res.subtotal).toBe(199.99);
      expect(res.taxTotal).toBe(23);
      expect(res.total).toBe(222.99);
    });

    it("handles fractional quantities and prices without floating point drift", () => {
      const items = [
        { description: "Hourly work", quantity: 1.5, unitPrice: 75.5, taxRate: 12 },
      ];
      const res = calcTotals(items);
      expect(res.subtotal).toBe(113.25);
      expect(res.taxTotal).toBe(13.59);
      expect(res.total).toBe(126.84);
    });
  });
});
