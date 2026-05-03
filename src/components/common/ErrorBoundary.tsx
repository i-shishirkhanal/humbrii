
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
                    <div className="max-w-md w-full bg-card border border-destructive/20 rounded-xl p-6 shadow-lg text-center">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-muted-foreground mb-6 text-sm">
                            We encountered an unexpected error. Our team has been notified.
                        </p>
                        <div className="bg-muted/50 rounded-lg p-3 text-left mb-6 overflow-auto max-h-32">
                            <code className="text-xs text-muted-foreground font-mono">
                                {this.state.error?.message}
                            </code>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                            >
                                Reload Page
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                            >
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
