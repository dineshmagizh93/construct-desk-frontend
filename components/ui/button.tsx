import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] touch-manipulation min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary active:from-primary/90 active:to-primary shadow-md hover:shadow-lg hover:shadow-primary/20 active:shadow-lg active:shadow-primary/20",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive active:from-destructive/90 active:to-destructive shadow-md hover:shadow-lg hover:shadow-destructive/20 active:shadow-lg active:shadow-destructive/20",
        outline:
          "border-2 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground active:bg-accent/50 active:text-accent-foreground hover:border-primary/50 active:border-primary/50 hover:shadow-md active:shadow-md",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary active:bg-secondary shadow-sm hover:shadow-md active:shadow-md",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground active:bg-accent/50 active:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline active:underline",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px]",
        sm: "h-9 rounded-md px-3 text-xs min-h-[44px]",
        lg: "h-11 rounded-lg px-8 text-base min-h-[44px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

