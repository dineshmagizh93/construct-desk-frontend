import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

/** Catches render-time errors anywhere below it so a single crash doesn't blank the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Wire to an error-tracking service (Sentry, etc.) here in production.
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Something went wrong</h1>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            An unexpected error occurred. Reloading the page usually fixes it — if it keeps happening, contact support.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    )
  }
}
