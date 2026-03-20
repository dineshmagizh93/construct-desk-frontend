"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight } from "lucide-react"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  limitType?: "users" | "projects" | "storage"
}

export function UpgradeModal({ open, onOpenChange, limitType }: UpgradeModalProps) {
  const router = useRouter()

  const getLimitMessage = () => {
    switch (limitType) {
      case "users":
        return "You have reached the user limit for your current subscription plan."
      case "projects":
        return "You have reached the project limit for your current subscription plan."
      case "storage":
        return "You have reached the storage limit for your current subscription plan."
      default:
        return "You have reached a limit of your current subscription plan."
    }
  }

  const handleUpgrade = () => {
    onOpenChange(false)
    router.push("/pricing")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>Plan Limit Reached</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {getLimitMessage()} Upgrade your plan to continue using this feature.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={handleUpgrade} variant="default" className="rounded-full">
            <ArrowRight className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
