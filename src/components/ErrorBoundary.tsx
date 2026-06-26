'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-zinc-500">Something went wrong</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 text-sm text-emerald-600"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
