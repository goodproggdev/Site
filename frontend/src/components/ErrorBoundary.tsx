/**
 * ErrorBoundary — cattura errori React e mostra UI di fallback.
 */
import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50vh",
              gap: "1rem",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e53e3e" }}>
              Qualcosa è andato storto
            </h2>
            <p style={{ color: "#718096" }}>
              {this.state.error?.message || "Errore sconosciuto"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: "0.5rem 1.5rem",
                background: "#3182ce",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Riprova
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
