import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function SiteProgressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}

