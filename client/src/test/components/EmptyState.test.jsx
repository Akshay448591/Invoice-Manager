import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "../../components/EmptyState";

describe("EmptyState Component (Component)", () => {
  it("renders title and description properly", () => {
    render(
      <EmptyState
        title="No invoices yet"
        body="Create your first invoice to get started."
      />,
    );
    expect(screen.getByText("No invoices yet")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first invoice to get started."),
    ).toBeInTheDocument();
  });

  it("renders checklist steps when provided", () => {
    const steps = ["Add a client", "Create invoice", "Download PDF"];
    render(
      <EmptyState
        title="Get Started"
        steps={steps}
      />,
    );
    expect(screen.getByText("Add a client")).toBeInTheDocument();
    expect(screen.getByText("Create invoice")).toBeInTheDocument();
    expect(screen.getByText("Download PDF")).toBeInTheDocument();
  });

  it("renders optional call to action button", () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>New Invoice</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "New Invoice" })).toBeInTheDocument();
  });
});
