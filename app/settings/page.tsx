"use client"

import * as React from "react"
import { CompanyProfileForm } from "@/components/settings/company-profile-form"
import { UserProfileSection } from "@/components/settings/user-profile-section"
import { SubscriptionSection } from "@/components/settings/subscription-section"
import { PageHeader } from "@/components/ui/page-header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"company" | "account" | "subscription">("company")

  return (
    <div className="flex flex-col h-full min-h-0">
      <PageHeader
        title="Settings"
        subtitle="Manage your company profile and personal account settings"
      />

      <div className="flex-shrink-0 mb-4 mt-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="h-9">
            <TabsTrigger value="company" className="text-[13px]">Company Profile</TabsTrigger>
            <TabsTrigger value="account" className="text-[13px]">Personal Account</TabsTrigger>
            <TabsTrigger value="subscription" className="text-[13px]">Subscription</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        <Tabs value={activeTab}>
          <TabsContent value="company" className="mt-0 pb-6 h-full">
            <div className="w-full">
              <CompanyProfileForm />
            </div>
          </TabsContent>
          
          <TabsContent value="account" className="mt-0 pb-6 h-full">
            <div className="w-full">
              <UserProfileSection />
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="mt-0 pb-6 h-full">
            <div className="w-full">
              <SubscriptionSection />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

