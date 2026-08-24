import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Target,
  Users,
  Building2,
  CheckSquare,
  ClipboardList,
  Calendar,
  FileText,
  FileSignature,
  Truck,
  HardHat,
  Package,
  Wrench,
  Receipt,
  CreditCard,
  BarChart3,
  FolderOpen,
  Bell,
  PieChart,
  Settings,
  Shield,
  UserCog,
} from 'lucide-react'
import type { ModuleKey } from '@/lib/modules'

export const ROLES = ['super_admin', 'admin', 'project_manager', 'site_engineer', 'accountant', 'sales_executive'] as const

export const ROLE_LABELS: Record<(typeof ROLES)[number], string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  project_manager: 'Project Manager',
  site_engineer: 'Site Engineer',
  accountant: 'Accountant',
  sales_executive: 'Sales Executive',
}

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  module: ModuleKey
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, module: 'dashboard' }],
  },
  {
    label: 'CRM & Sales',
    items: [
      { label: 'Leads', to: '/leads', icon: Target, module: 'leads' },
      { label: 'Clients', to: '/clients', icon: Users, module: 'clients' },
    ],
  },
  {
    label: 'Project Delivery',
    items: [
      { label: 'Projects', to: '/projects', icon: Building2, module: 'projects' },
      { label: 'Tasks', to: '/tasks', icon: CheckSquare, module: 'tasks' },
      { label: 'Site Progress', to: '/site-progress', icon: ClipboardList, module: 'site-progress' },
      { label: 'Calendar', to: '/calendar', icon: Calendar, module: 'calendar' },
    ],
  },
  {
    label: 'Pre-Construction',
    items: [
      { label: 'Estimates & BOQ', to: '/estimates', icon: FileText, module: 'estimates' },
      { label: 'Contracts & POs', to: '/contracts', icon: FileSignature, module: 'contracts' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Vendors & Suppliers', to: '/vendors', icon: Truck, module: 'vendors' },
      { label: 'Labour', to: '/labour', icon: HardHat, module: 'labour' },
      { label: 'Inventory', to: '/inventory', icon: Package, module: 'inventory' },
      { label: 'Equipment', to: '/equipment', icon: Wrench, module: 'equipment' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Expenses', to: '/expenses', icon: Receipt, module: 'expenses' },
      { label: 'Payments & Invoices', to: '/payments', icon: CreditCard, module: 'payments' },
      { label: 'Financial Reports', to: '/finance-reports', icon: BarChart3, module: 'finance-reports' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Documents', to: '/documents', icon: FolderOpen, module: 'documents' },
      { label: 'Notifications', to: '/notifications', icon: Bell, module: 'notifications' },
      { label: 'Reports & Analytics', to: '/reports', icon: PieChart, module: 'reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings, module: 'settings' },
      { label: 'Users', to: '/users', icon: UserCog, module: 'users' },
      { label: 'Roles & Permissions', to: '/roles', icon: Shield, module: 'roles' },
    ],
  },
]

export type StatusColor = 'default' | 'secondary' | 'accent' | 'success' | 'warning' | 'destructive' | 'outline'

export const STATUS_COLORS: Record<string, StatusColor> = {
  active: 'success',
  in_progress: 'warning',
  pending: 'warning',
  planning: 'secondary',
  on_hold: 'destructive',
  completed: 'success',
  cancelled: 'destructive',
  won: 'success',
  lost: 'destructive',
  new: 'secondary',
  contacted: 'warning',
  site_visit: 'warning',
  quoted: 'accent',
  paid: 'success',
  overdue: 'destructive',
  draft: 'secondary',
  sent: 'warning',
  approved: 'success',
  rejected: 'destructive',
}
