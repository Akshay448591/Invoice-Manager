import { Component } from 'react';
import ErrorPage from '../pages/ErrorPage';

// Catches crashes while rendering and shows a friendly error page instead of a blank screen
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an exception:", error, info);
    try {
      if (typeof window !== "undefined" && window.fetch) {
        window.fetch("/api/health/telemetry/errors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: { message: error?.message, stack: error?.stack },
            info: info?.componentStack,
            url: window.location.href,
          }),
        }).catch(() => {});
      }
    } catch {
      // Ignore network errors in error boundary
    }
  }

  render() {
    return this.state.error ? <ErrorPage error={this.state.error} /> : this.props.children;
  }
}
