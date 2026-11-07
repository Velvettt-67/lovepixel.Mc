import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e050f] flex items-center justify-center p-6 text-[#fdf2f4]">
          <div className="max-w-xl w-full bg-[#180817] rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#e8a8b8]/25 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#2f122c] text-[#f472b6] flex items-center justify-center mx-auto mb-4 border border-[#e8a8b8]/20">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl text-[#fdf2f4] mb-2 font-normal">
              {this.props.fallbackTitle || 'A gentle pause in the room'}
            </h2>

            <p className="font-editorial text-base text-[#d8afbf] mb-6 leading-relaxed">
              An unexpected rendering issue occurred. Our caretakers have logged the details below so you are never left with a blank screen.
            </p>

            {this.state.error && (
              <div className="p-4 mb-6 bg-[#220d20] rounded-2xl text-left border border-[#e8a8b8]/20 max-h-48 overflow-auto">
                <p className="font-mono text-xs text-rose-300 font-semibold mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="font-mono text-[10px] text-[#d8afbf] whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#b54a67] via-[#d3738b] to-[#b54a67] hover:shadow-lg transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-[#fdf2f4] liquid-glass-dark hover:border-white/40 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
