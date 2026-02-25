import React, { Component, ComponentType, ErrorInfo, PropsWithChildren, ReactNode } from "react";
import { ErrorFallback, ErrorFallbackProps } from "@/components/ErrorFallback";
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type ErrorBoundaryProps = PropsWithChildren<{
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  maxAutoRetries?: number;
  retryDelayMs?: number;
}>;

type ErrorBoundaryState = {
  error: Error | null;
  hasError: boolean;
  retryCount: number;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { 
    error: null, 
    hasError: false, 
    retryCount: 0 
  };
  
  private retryTimer: NodeJS.Timeout | null = null;

  static defaultProps: Partial<ErrorBoundaryProps> = {
    FallbackComponent: ErrorFallback,
    maxAutoRetries: 3,
    retryDelayMs: 1500,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      error, 
      hasError: true 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('🚨 ErrorBoundary caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    const { maxAutoRetries = 3, retryDelayMs = 1500 } = this.props;
    
    // Auto-retry logic
    if (this.state.retryCount < maxAutoRetries) {
      this.retryTimer = setTimeout(() => {
        this.setState(prev => ({
          error: null,
          hasError: false,
          retryCount: prev.retryCount + 1,
        }));
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }, retryDelayMs);
      
      return;
    }

    // Final error reporting
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState): void {
    // Reset retry count if children change
    if (prevProps.children !== this.props.children && !this.state.hasError) {
      this.setState({ retryCount: 0 });
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  resetError = (): void => {
    this.setState({ 
      error: null, 
      hasError: false, 
      retryCount: 0 
    });
    
    this.props.onReset?.();
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  render(): ReactNode {
    const { children, FallbackComponent } = this.props;
    const { error, hasError, retryCount } = this.state;
    const { maxAutoRetries = 3 } = this.props;

    if (hasError && retryCount >= maxAutoRetries && FallbackComponent && error) {
      return (
        <FallbackComponent
          error={error}
          retryCount={retryCount}
          maxRetries={maxAutoRetries}
          resetError={this.resetError}
        />
      );
    }

    return children;
  }
}



// Functional wrapper for hooks compatibility
export function useErrorBoundary() {
  const [, setErrorState] = React.useState({ hasError: false });
  
  const resetError = React.useCallback(() => {
    setErrorState({ hasError: false });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  return { resetError };
}

// Higher-Order Component factory
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  return (props: P) => (
    <ErrorBoundary {...fallbackProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
}
