import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../../components/StatusBadge";

describe("StatusBadge Component (Unit/Component)", () => {
  it("renders the correct label for paid status", () => {
    render(<StatusBadge value="paid" />);
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("renders the correct label for draft status", () => {
    render(<StatusBadge value="draft" />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders the correct label for overdue status", () => {
    render(<StatusBadge value="overdue" />);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("renders title-cased snake_case status properly", () => {
    render(<StatusBadge value="in_progress" />);
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("falls back gracefully for unknown status values", () => {
    render(<StatusBadge value="custom_status" />);
    expect(screen.getByText("Custom status")).toBeInTheDocument();
  });
});
