"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { ApiError } from "@/lib/api/client"
import { UpgradeModal } from "@/components/subscription/upgrade-modal"

export function usePlanLimits() {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [limitType, setLimitType] = useState<"users" | "projects" | "storage">()

  const handleError = useCallback((error: unknown) => {
    const apiError = error as ApiError
    if (apiError.message === "PLAN_LIMIT_USERS") {
      setLimitType("users")
      setUpgradeModalOpen(true)
      return true
    } else if (apiError.message === "PLAN_LIMIT_PROJECTS") {
      setLimitType("projects")
      setUpgradeModalOpen(true)
      return true
    } else if (apiError.message === "PLAN_LIMIT_STORAGE") {
      setLimitType("storage")
      setUpgradeModalOpen(true)
      return true
    }
    return false
  }, [])

  const UpgradeModalComponent = () => (
    <UpgradeModal
      open={upgradeModalOpen}
      onOpenChange={setUpgradeModalOpen}
      limitType={limitType}
    />
  )

  return {
    handleError,
    UpgradeModalComponent,
  }
}
