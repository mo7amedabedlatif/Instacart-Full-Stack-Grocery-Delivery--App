import React, { ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Increment error count
    this.setState((prev) => ({
      errorCount: prev.errorCount + 1,
    }));

    // Send error to monitoring service (e.g., Sentry)
    // TODO: Integrate with error tracking service
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app-cream flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-red-200 text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="size-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="size-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-app-green mb-2">
              حدث خطأ ما!
            </h1>

            {/* Description */}
            <p className="text-sm text-app-text-light mb-4">
              نعتذر، لكن حدث خطأ غير متوقع. يرجى محاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-3 bg-red-50 rounded-lg text-left border border-red-200">
                <p className="text-xs font-mono text-red-700 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Error Count */}
            {this.state.errorCount > 2 && (
              <div className="mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  ⚠️ حدثت عدة أخطاء. قد يكون هناك مشكلة في الاتصال.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="size-4" />
                إعادة محاولة
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 bg-app-green text-white font-medium rounded-lg hover:bg-app-green-light transition-colors flex items-center justify-center gap-2"
              >
                <Home className="size-4" />
                الصفحة الرئيسية
              </button>
            </div>

            {/* Support */}
            <div className="mt-6 pt-6 border-t border-app-border">
              <p className="text-xs text-app-text-light">
                هل تحتاج للمساعدة؟{" "}
                <a
                  href="#"
                  className="text-app-green font-medium hover:underline"
                >
                  تواصل معنا
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
