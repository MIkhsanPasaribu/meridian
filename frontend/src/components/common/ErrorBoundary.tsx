"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component that catches React rendering errors.
 * Displays a user-friendly error message with a retry option.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="p-3 rounded-full bg-[#EF4444]/10 mb-4">
            <AlertTriangle size={24} className="text-[#EF4444]" />
          </div>
          <h3 className="text-base font-semibold text-[#E8EDF5] mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-[#8B9BB4] mb-4 max-w-sm">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#161B25] border border-[#1E2737] text-sm text-[#8B9BB4] hover:text-[#E8EDF5] transition-colors"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
