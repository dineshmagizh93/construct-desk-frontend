import type { ReactNode } from 'react'
import { keepPreviousData, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'

// DB round-trips are slow (distant Supabase region), so cache hard: once a module's data is
// loaded it stays fresh for 5 min and cached for 30 min, making navigation between already-visited
// pages instant and fetching shared data (e.g. projects) only once. Mutations invalidate keys to
// refresh, so this doesn't cause staleness after edits.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      placeholderData: keepPreviousData,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
