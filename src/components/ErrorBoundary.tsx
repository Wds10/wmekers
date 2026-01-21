
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.fallback;
        }

        return this.props.children;
    }

    private get fallback() {
        return this.props.fallback || (
            <div className="w-full h-full flex items-center justify-center bg-surface text-gray-500 rounded-xl border border-white/10 p-4 text-center">
                <div>
                    <p className="font-bold">Preview Error</p>
                    <p className="text-sm">Could not load 3D Model</p>
                </div>
            </div>
        );
    }
}
