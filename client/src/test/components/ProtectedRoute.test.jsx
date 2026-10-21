import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute";
import * as AuthContextModule from "../../context/AuthContext";

vi.mock("../../context/AuthContext", async () => {
  const actual = await vi.importActual("../../context/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe("ProtectedRoute Guard (Integration/Component)", () => {
  it("renders loader while session is loading", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute role="business">
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to /login", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="business">
                <div>Protected Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Dashboard")).not.toBeInTheDocument();
  });

  it("renders protected child content when user is authenticated with proper role", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { id: "123", role: "business", name: "Boss" },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="business">
                <div>Protected Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Dashboard Content")).toBeInTheDocument();
  });

  it("redirects user when role does not match requirement", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { id: "456", role: "client", name: "Client A" },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="business">
                <div>Protected Business Page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/portal" element={<div>Client Portal Home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Client Portal Home")).toBeInTheDocument();
    expect(screen.queryByText("Protected Business Page")).not.toBeInTheDocument();
  });
});
