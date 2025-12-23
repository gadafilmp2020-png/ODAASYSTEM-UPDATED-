import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './odaa-main/App'; // Corrected import path

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Fix: Explicitly extending React.Component and adding property declarations to satisfy strict TypeScript checks
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declaring props to satisfy strict TypeScript checks
  public props: ErrorBoundaryProps;

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix: Initializing props explicitly for the compiler
    this.props = props;
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("System Crash:", error, errorInfo);
  }

  render() {
    // Fix: Using this.state which is now explicitly declared
    if (this.state.hasError) {
      const errorString = this.state.error instanceof Error 
        ? this.state.error.message 
        : String(this.state.error);

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans text-slate-200">
          <div className="bg-slate-900 border border-red-500/30 p-10 rounded-[2.5rem] max-w-xl w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 to-orange-600"></div>
            <h2 className="text-3xl font-bold text-red-500 mb-4 font-sans tracking-tight">System Error</h2>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm">The application encountered an unexpected error. Please try again.</p>
            <div className="bg-black/60 p-5 rounded-2xl border border-slate-800 mb-8 overflow-auto max-h-40">
              <code className="text-[10px] text-red-400 font-mono break-all">{errorString}</code>
            </div>
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }} 
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-red-900/40"
            >
              Reset Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}