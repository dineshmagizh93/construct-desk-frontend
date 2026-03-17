"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * Navigation Loading Indicator
 * Shows a subtle loading bar at the top during navigation
 * Doesn't block the UI, just provides visual feedback
 */
export function NavigationLoading() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = React.useState(false)

  React.useEffect(() => {
    // Show loading indicator briefly during navigation
    setIsNavigating(true)
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 200) // Hide after 200ms (navigation should be instant with prefetching)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent transition-opacity duration-200",
        isNavigating ? "opacity-100" : "opacity-0"
      )}
    >
      <div 
        className={cn(
          "h-full bg-primary transition-all duration-300 ease-out",
          isNavigating ? "w-full" : "w-0"
        )}
        style={{
          background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 50%, hsl(var(--primary)) 100%)",
          backgroundSize: "200% 100%",
          animation: isNavigating ? "shimmer 0.5s ease-in-out" : "none"
        }}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `
      }} />
    </div>
  )
}
