import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
