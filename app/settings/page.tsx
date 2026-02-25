"use client"

import { CompanyProfileForm } from "@/components/settings/company-profile-form"
import { CategoriesSection } from "@/components/settings/categories-section"
import { UserProfileSection } from "@/components/settings/user-profile-section"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your company profile, categories, and account settings
        </p>
      </div>

      {/* Company Profile */}
      <CompanyProfileForm />

      {/* Categories Section */}
      <CategoriesSection />

      {/* User Profile Section */}
      <UserProfileSection />
    </div>
  )
}

