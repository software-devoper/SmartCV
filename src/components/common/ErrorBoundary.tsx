import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  sectionName?: string;
  onReset?: () => void;
  showHomeButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleFullRefresh = () => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const isSection = Boolean(this.props.sectionName);

      return (
        <div
          role="alert"
          className={`flex flex-col items-center justify-center p-6 text-center ${
            isSection
              ? 'w-full h-full min-h-[300px] bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-200'
              : 'min-h-screen bg-slate-950 text-slate-100'
          }`}
        >
          <div className="max-w-md w-full mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/5">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {this.props.fallbackTitle ||
                  (this.props.sectionName
                    ? `${this.props.sectionName} Encountered an Issue`
                    : 'Something went wrong')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {this.props.fallbackMessage ||
                  "An unexpected error occurred while rendering this view. Don't worry, your saved resume data is preserved in local storage."}
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 mb-1">
                  Error Details
                </p>
                <p className="text-xs font-mono text-slate-300 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry View</span>
              </button>

              <button
                type="button"
                onClick={this.handleFullRefresh}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-98"
              >
                <span>Reload App</span>
              </button>

              {this.props.showHomeButton && (
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
