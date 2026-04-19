import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  menuRef?: React.RefObject<HTMLDivElement>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined)

const DropdownMenu = ({ 
  children,
  open: controlledOpen,
  onOpenChange
}: { 
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Don't close if clicking inside the dropdown menu or its content
      if (!target.closest('[data-dropdown-menu]') && 
          !target.closest('[data-dropdown-content]')) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('click', handleClickOutside, true)
      return () => {
        document.removeEventListener('click', handleClickOutside, true)
      }
    }
  }, [open, setOpen])

  const menuRef = React.useRef<HTMLDivElement>(null)
  
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, menuRef }}>
      <div 
        ref={menuRef}
        className={cn("relative", open ? "z-[9999]" : "z-10")} 
        data-dropdown-menu 
        style={{ isolation: 'isolate' }}
      >
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu')

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    context.setOpen(!context.open)
  }

  return (
    <div 
      onClick={handleClick} 
      className="cursor-pointer relative"
      data-dropdown-trigger
      style={{ zIndex: context.open ? 10000 : 'auto' }}
    >
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ 
  children, 
  className,
  align = "end" 
}: { 
  children: React.ReactNode
  className?: string
  align?: "start" | "end"
}) => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu')
  
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0, right: 0 })

  React.useEffect(() => {
    if (context.open && context.menuRef?.current) {
      const updatePosition = () => {
        // Find the trigger element within this specific dropdown menu
        const menuContainer = context.menuRef?.current
        if (menuContainer) {
          const trigger = menuContainer.querySelector('[data-dropdown-trigger]') as HTMLElement
          if (trigger) {
            triggerRef.current = trigger
            const rect = trigger.getBoundingClientRect()
            
            if (align === "end") {
              setPosition({
                top: rect.bottom + 8,
                left: 0,
                right: typeof window !== 'undefined' ? window.innerWidth - rect.right : 0
              })
            } else {
              setPosition({
                top: rect.bottom + 8,
                left: rect.left,
                right: 0
              })
            }
          }
        }
      }
      
      updatePosition()
      
      // Update position on scroll or resize
      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', updatePosition, true)
        window.addEventListener('resize', updatePosition)
        
        return () => {
          window.removeEventListener('scroll', updatePosition, true)
          window.removeEventListener('resize', updatePosition)
        }
      }
    }
  }, [context.open, context.menuRef, align])

  if (!context.open) return null

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={contentRef}
      data-dropdown-content
      className={cn(
        "fixed min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
        className
      )}
      style={{ 
        position: 'fixed',
        zIndex: 9999,
        top: `${position.top}px`,
        ...(align === "end" ? { right: `${position.right}px` } : { left: `${position.left}px` })
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  )
}

const DropdownMenuItem = ({ 
  children, 
  className,
  onClick,
  asChild
}: { 
  children: React.ReactNode
  className?: string
  onClick?: (e?: React.MouseEvent) => void
  asChild?: boolean
}) => {
  const context = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent) => {
    // Prevent the click from bubbling up to row/table containers
    e.stopPropagation()
    // Close menu first
    context?.setOpen(false)
    // Then call onClick handler (navigation)
    // Use setTimeout to ensure menu closes before navigation
    setTimeout(() => {
      onClick?.(e)
    }, 0)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        handleClick(e)
        if (children.props.onClick) {
          children.props.onClick(e)
        }
      },
      className: cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground focus:bg-accent focus:text-accent-foreground touch-manipulation min-h-[44px]",
        className,
        children.props.className
      )
    } as any)
  }

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground focus:bg-accent focus:text-accent-foreground touch-manipulation min-h-[44px]",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}

