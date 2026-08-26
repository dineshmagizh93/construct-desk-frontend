import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { MarketingLayout } from '@/features/marketing/components/MarketingLayout'
import { Skeleton } from '@/components/ui/skeleton'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const ImpersonatePage = lazy(() =>
  import('@/features/auth/pages/ImpersonatePage').then((m) => ({ default: m.ImpersonatePage })),
)

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))

const LeadsPage = lazy(() => import('@/features/leads/pages/LeadsPage').then((m) => ({ default: m.LeadsPage })))
const ClientsListPage = lazy(() => import('@/features/clients/pages/ClientsListPage').then((m) => ({ default: m.ClientsListPage })))
const ClientDetailPage = lazy(() => import('@/features/clients/pages/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage })))

const ProjectsListPage = lazy(() => import('@/features/projects/pages/ProjectsListPage').then((m) => ({ default: m.ProjectsListPage })))
const ProjectDetailPage = lazy(() =>
  import('@/features/projects/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const TasksListPage = lazy(() => import('@/features/tasks/pages/TasksListPage').then((m) => ({ default: m.TasksListPage })))
const SiteProgressListPage = lazy(() =>
  import('@/features/site-progress/pages/SiteProgressListPage').then((m) => ({ default: m.SiteProgressListPage })),
)
const CalendarPage = lazy(() => import('@/features/calendar/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })))

const EstimatesListPage = lazy(() =>
  import('@/features/estimates/pages/EstimatesListPage').then((m) => ({ default: m.EstimatesListPage })),
)
const ContractsListPage = lazy(() =>
  import('@/features/contracts/pages/ContractsListPage').then((m) => ({ default: m.ContractsListPage })),
)

const VendorsListPage = lazy(() => import('@/features/vendors/pages/VendorsListPage').then((m) => ({ default: m.VendorsListPage })))
const LabourListPage = lazy(() => import('@/features/labour/pages/LabourListPage').then((m) => ({ default: m.LabourListPage })))
const InventoryListPage = lazy(() =>
  import('@/features/inventory/pages/InventoryListPage').then((m) => ({ default: m.InventoryListPage })),
)
const EquipmentListPage = lazy(() =>
  import('@/features/equipment/pages/EquipmentListPage').then((m) => ({ default: m.EquipmentListPage })),
)

const ExpensesListPage = lazy(() =>
  import('@/features/expenses/pages/ExpensesListPage').then((m) => ({ default: m.ExpensesListPage })),
)
const PaymentsListPage = lazy(() =>
  import('@/features/payments/pages/PaymentsListPage').then((m) => ({ default: m.PaymentsListPage })),
)
const FinanceReportsPage = lazy(() =>
  import('@/features/finance-reports/pages/FinanceReportsPage').then((m) => ({ default: m.FinanceReportsPage })),
)

const DocumentsListPage = lazy(() =>
  import('@/features/documents/pages/DocumentsListPage').then((m) => ({ default: m.DocumentsListPage })),
)
const NotificationsPage = lazy(() =>
  import('@/features/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
)
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const UsersListPage = lazy(() => import('@/features/users/pages/UsersListPage').then((m) => ({ default: m.UsersListPage })))
const RolesPage = lazy(() => import('@/features/roles/pages/RolesPage').then((m) => ({ default: m.RolesPage })))
const PaywallPage = lazy(() => import('@/features/billing/pages/PaywallPage').then((m) => ({ default: m.PaywallPage })))

const HomePage = lazy(() => import('@/features/marketing/pages/HomePage').then((m) => ({ default: m.HomePage })))
const FeaturesPage = lazy(() => import('@/features/marketing/pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })))
const ModulesPage = lazy(() => import('@/features/marketing/pages/ModulesPage').then((m) => ({ default: m.ModulesPage })))
const HowItWorksPage = lazy(() => import('@/features/marketing/pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })))
const IndustriesPage = lazy(() => import('@/features/marketing/pages/IndustriesPage').then((m) => ({ default: m.IndustriesPage })))
const PricingPage = lazy(() => import('@/features/marketing/pages/PricingPage').then((m) => ({ default: m.PricingPage })))
const FaqPage = lazy(() => import('@/features/marketing/pages/FaqPage').then((m) => ({ default: m.FaqPage })))
const RequestDemoPage = lazy(() => import('@/features/marketing/pages/RequestDemoPage').then((m) => ({ default: m.RequestDemoPage })))
const TermsPage = lazy(() => import('@/features/marketing/pages/TermsPage').then((m) => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('@/features/marketing/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const RefundPolicyPage = lazy(() =>
  import('@/features/marketing/pages/RefundPolicyPage').then((m) => ({ default: m.RefundPolicyPage })),
)

function PageFallback() {
  return (
    <div className="space-y-3 p-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>
}

const router = createBrowserRouter([
  { path: '/impersonate', element: withSuspense(<ImpersonatePage />) },
  {
    element: <MarketingLayout />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
      { path: '/features', element: withSuspense(<FeaturesPage />) },
      { path: '/modules', element: withSuspense(<ModulesPage />) },
      { path: '/how-it-works', element: withSuspense(<HowItWorksPage />) },
      { path: '/industries', element: withSuspense(<IndustriesPage />) },
      { path: '/pricing', element: withSuspense(<PricingPage />) },
      { path: '/faq', element: withSuspense(<FaqPage />) },
      { path: '/request-demo', element: withSuspense(<RequestDemoPage />) },
      { path: '/terms-of-service', element: withSuspense(<TermsPage />) },
      { path: '/privacy-policy', element: withSuspense(<PrivacyPage />) },
      { path: '/refund-policy', element: withSuspense(<RefundPolicyPage />) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
      { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: withSuspense(<DashboardPage />) },
      { path: 'leads', element: withSuspense(<LeadsPage />) },
      { path: 'clients', element: withSuspense(<ClientsListPage />) },
      { path: 'clients/:id', element: withSuspense(<ClientDetailPage />) },
      { path: 'projects', element: withSuspense(<ProjectsListPage />) },
      { path: 'projects/:id', element: withSuspense(<ProjectDetailPage />) },
      { path: 'tasks', element: withSuspense(<TasksListPage />) },
      { path: 'site-progress', element: withSuspense(<SiteProgressListPage />) },
      { path: 'calendar', element: withSuspense(<CalendarPage />) },
      { path: 'estimates', element: withSuspense(<EstimatesListPage />) },
      { path: 'contracts', element: withSuspense(<ContractsListPage />) },
      { path: 'vendors', element: withSuspense(<VendorsListPage />) },
      { path: 'labour', element: withSuspense(<LabourListPage />) },
      { path: 'inventory', element: withSuspense(<InventoryListPage />) },
      { path: 'equipment', element: withSuspense(<EquipmentListPage />) },
      { path: 'expenses', element: withSuspense(<ExpensesListPage />) },
      { path: 'payments', element: withSuspense(<PaymentsListPage />) },
      { path: 'finance-reports', element: withSuspense(<FinanceReportsPage />) },
      { path: 'documents', element: withSuspense(<DocumentsListPage />) },
      { path: 'notifications', element: withSuspense(<NotificationsPage />) },
      { path: 'reports', element: withSuspense(<ReportsPage />) },
      { path: 'users', element: withSuspense(<UsersListPage />) },
      { path: 'roles', element: withSuspense(<RolesPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
      { path: 'billing/paywall', element: withSuspense(<PaywallPage />) },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
