import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function UsageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}

