import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NyayaVault Boundary Caught Unhandled Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060911] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900/90 border border-red-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500/30 uppercase tracking-widest">
                Cryptographic Module Guard
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-heading">
                {this.props.fallbackTitle || 'Component Render Failure'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                NyayaVault's isolation shield intercepted an unexpected client-side exception. The cryptographic integrity of the underlying ledger is preserved.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-left text-xs font-mono text-red-400 overflow-x-auto max-h-40">
                <div className="font-bold text-slate-300 mb-1">{this.state.error.name}: {this.state.error.message}</div>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-slate-500 whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-cyan-600/20 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recover Component State</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Full System Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
