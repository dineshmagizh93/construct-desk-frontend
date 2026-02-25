import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

const Sheet = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error('SheetTrigger must be used within Sheet')

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => context.setOpen(true),
    } as any)
  }

  return (
    <div onClick={() => context.setOpen(true)}>
      {children}
    </div>
  )
}

const SheetContent = ({ 
  children, 
  side = "left",
  className 
}: { 
  children: React.ReactNode
  side?: "left" | "right"
  className?: string
}) => {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error('SheetContent must be used within Sheet')

  if (!context.open) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => context.setOpen(false)}
      />
      <div
        className={cn(
          "fixed z-50 h-full w-80 bg-background p-6 shadow-lg transition-transform",
          side === "left" ? "left-0" : "right-0",
          className
        )}
      >
        <button
          onClick={() => context.setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 active:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 touch-manipulation min-h-[44px] min-w-[44px]"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </>
  )
}

// Hook to access sheet context
const useSheet = () => {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error('useSheet must be used within Sheet')
  return context
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  useSheet,
}

