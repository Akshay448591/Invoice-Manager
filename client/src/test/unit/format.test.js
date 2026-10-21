import { describe, it, expect } from "vitest";
import { money, fmtDate, titleCase, todayISO, inDaysISO } from "../../utils/format";

describe("Format Utilities (Unit)", () => {
  describe("money()", () => {
    it("formats Indian Rupee currency correctly with thousand separators", () => {
      expect(money(0)).toBe("₹0");
      expect(money(500)).toBe("₹500");
      expect(money(1500)).toBe("₹1,500");
      expect(money(100000)).toBe("₹1,00,000");
    });

    it("handles null or undefined input gracefully", () => {
      expect(money(null)).toBe("₹0");
      expect(money(undefined)).toBe("₹0");
    });
  });

  describe("fmtDate()", () => {
    it("formats dates in UTC to avoid time zone shift", () => {
      const d = new Date("2026-05-15T00:00:00.000Z");
      const formatted = fmtDate(d);
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/May/);
      expect(formatted).toMatch(/2026/);
    });

    it("returns dash for missing date", () => {
      expect(fmtDate(null)).toBe("—");
      expect(fmtDate(undefined)).toBe("—");
    });
  });

  describe("titleCase()", () => {
    it("converts snake_case or lowercase strings to Title Case", () => {
      expect(titleCase("in_progress")).toBe("In progress");
      expect(titleCase("draft")).toBe("Draft");
      expect(titleCase("paid")).toBe("Paid");
      expect(titleCase("")).toBe("");
    });
  });

  describe("todayISO() and inDaysISO()", () => {
    it("produces valid YYYY-MM-DD date strings", () => {
      const today = todayISO();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const future = inDaysISO(7);
      expect(future).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
