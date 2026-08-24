import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface CopyableIdProps {
  value: string
  className?: string
}

export function CopyableId({ value, className }: CopyableIdProps) {
  const [copied, setCopied] = useState(false)

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(value)
    setCopied(true)
    toast({ title: 'Copied', description: `${value} copied to clipboard.`, variant: 'success' })
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn('inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 font-mono text-xs hover:bg-secondary', className)}
      title="Copy Project ID"
    >
      {value}
      {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3 text-muted-foreground" />}
    </button>
  )
}
