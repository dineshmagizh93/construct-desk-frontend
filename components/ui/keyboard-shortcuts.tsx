"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"

interface ShortcutGroup {
  label: string
  shortcuts: Array<{ keys: string[]; description: string }>
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "K"], description: "Open command palette" },
      { keys: ["G", "D"], description: "Go to Dashboard" },
      { keys: ["G", "P"], description: "Go to Projects" },
      { keys: ["G", "T"], description: "Go to Tasks" },
      { keys: ["G", "R"], description: "Go to Reports" },
    ],
  },
  {
    label: "Actions",
    shortcuts: [
      { keys: ["N", "P"], description: "New Project" },
      { keys: ["N", "T"], description: "New Task" },
      { keys: ["N", "L"], description: "New Lead" },
      { keys: ["Escape"], description: "Close dialog / panel" },
    ],
  },
  {
    label: "General",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Ctrl", "S"], description: "Save current form" },
      { keys: ["Ctrl", "Z"], description: "Undo last action" },
    ],
  },
]

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-semibold text-slate-600 shadow-sm">
      {children}
    </kbd>
  )
}

interface KeyboardShortcutsProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcutsOverlay({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-slate-600" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
              <div className="space-y-2">
                {group.shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[13px] text-slate-600">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((key, ki) => (
                        <span key={ki} className="flex items-center gap-1">
                          <Kbd>{key}</Kbd>
                          {ki < s.keys.length - 1 && (
                            <span className="text-[10px] text-slate-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">Press Escape to close</p>
      </DialogContent>
    </Dialog>
  )
}

export function useKeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setOpen(true)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return { open, setOpen }
}
