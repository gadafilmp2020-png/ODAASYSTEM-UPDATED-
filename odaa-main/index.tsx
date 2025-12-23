import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-red-500 mb-4 font-mono">SYSTEM CRITICAL ERROR</h2>
            <p className="text-slate-300 mb-4">The interface encountered an unexpected termination.</p>
            <div className="bg-black/50 p-4 rounded-lg border border-slate-800 mb-6 overflow-auto max-h-40">
              <code className="text-xs text-red-400 font-mono">{this.state.error?.toString()}</code>
            </div>
            <button 
              onClick={() => {
                localStorage.clear(); 
                window.location.reload();
              }} 
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold uppercase tracking-widest transition-colors"
            >
              Hard Reset System (Clear Data)
            </button>
          </div>
        </div>
      );
    }

    // Fix: Using this.props which is now explicitly declared
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);