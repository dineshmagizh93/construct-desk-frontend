import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}

