import React from 'react'

interface State {
  hasError: boolean
}

interface Props {
  fallback: React.ReactNode
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {hasError: false}
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true}
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback
    }

    return this.props.children
  }
}
