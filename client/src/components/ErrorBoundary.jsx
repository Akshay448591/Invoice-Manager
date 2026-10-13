import { Component } from 'react';
import ErrorPage from '../pages/ErrorPage';

// Catches crashes while rendering and shows a friendly error page instead of a blank screen
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    return this.state.error ? <ErrorPage error={this.state.error} /> : this.props.children;
  }
}
