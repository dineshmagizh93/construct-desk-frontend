/** Canonical module keys — keep in sync with backend shared/modules.ts */
export const MODULE_KEYS = [
  'dashboard',
  'leads',
  'clients',
  'projects',
  'tasks',
  'site-progress',
  'calendar',
  'estimates',
  'contracts',
  'vendors',
  'labour',
  'inventory',
  'equipment',
  'expenses',
  'payments',
  'finance-reports',
  'documents',
  'notifications',
  'reports',
  'settings',
  'users',
  'roles',
] as const

export type ModuleKey = (typeof MODULE_KEYS)[number]
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete'

export interface ModulePermission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

export type PermissionMap = Record<ModuleKey, ModulePermission>

export const MODULE_GROUPS: { label: string; modules: { key: ModuleKey; label: string }[] }[] = [
  { label: 'Overview', modules: [{ key: 'dashboard', label: 'Dashboard' }] },
  {
    label: 'CRM & Sales',
    modules: [
      { key: 'leads', label: 'Leads' },
      { key: 'clients', label: 'Clients' },
    ],
  },
  {
    label: 'Project Delivery',
    modules: [
      { key: 'projects', label: 'Projects' },
      { key: 'tasks', label: 'Tasks' },
      { key: 'site-progress', label: 'Site Progress' },
      { key: 'calendar', label: 'Calendar' },
    ],
  },
  {
    label: 'Pre-Construction',
    modules: [
      { key: 'estimates', label: 'Estimates & BOQ' },
      { key: 'contracts', label: 'Contracts & POs' },
    ],
  },
  {
    label: 'Resources',
    modules: [
      { key: 'vendors', label: 'Vendors & Suppliers' },
      { key: 'labour', label: 'Labour' },
      { key: 'inventory', label: 'Inventory' },
      { key: 'equipment', label: 'Equipment' },
    ],
  },
  {
    label: 'Finance',
    modules: [
      { key: 'expenses', label: 'Expenses' },
      { key: 'payments', label: 'Payments & Invoices' },
      { key: 'finance-reports', label: 'Financial Reports' },
    ],
  },
  {
    label: 'Operations',
    modules: [
      { key: 'documents', label: 'Documents' },
      { key: 'notifications', label: 'Notifications' },
      { key: 'reports', label: 'Reports & Analytics' },
    ],
  },
  {
    label: 'System',
    modules: [
      { key: 'settings', label: 'Settings' },
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles & Permissions' },
    ],
  },
]

/** Starter plan's module allowlist — mirrors backend shared/modules.ts STARTER_MODULE_KEYS exactly.
 * Single source of truth for the pricing/comparison page so marketing copy can't drift from what's
 * actually enforced. */
export const STARTER_MODULE_KEYS: ModuleKey[] = [
  'dashboard',
  'leads',
  'clients',
  'projects',
  'tasks',
  'calendar',
  'expenses',
  'documents',
  'notifications',
  'settings',
  'users',
  'roles',
]

export function emptyPermissions(): PermissionMap {
  const map = {} as PermissionMap
  for (const key of MODULE_KEYS) {
    map[key] = { view: false, create: false, edit: false, delete: false }
  }
  return map
}

export function canPerform(
  permissions: PermissionMap | undefined,
  module: string,
  action: PermissionAction,
): boolean {
  if (!permissions) return false
  if (!(MODULE_KEYS as readonly string[]).includes(module)) return false
  return permissions[module as ModuleKey]?.[action] ?? false
}
