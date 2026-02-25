import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}

