import React, { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console (can be replaced with Sentry or other error tracking)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="rounded-md border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="mb-2 text-lg font-semibold text-slate-900">Something went wrong</h1>
            <p className="mb-4 text-sm text-slate-600">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-slate-500">Error details</summary>
                <pre className="mt-2 overflow-auto rounded bg-slate-100 p-2 text-xs">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

