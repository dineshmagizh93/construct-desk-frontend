import {
  Target,
  Building2,
  CreditCard,
  FolderOpen,
  ShieldCheck,
  UploadCloud,
  IndianRupee,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { STATUS_COLORS } from '@/lib/constants'
import { MODULE_GROUPS, STARTER_MODULE_KEYS, type ModuleKey } from '@/lib/modules'

export interface MarketingNavLink {
  label: string
  to: string
}

export const MARKETING_NAV_LINKS: MarketingNavLink[] = [
  { label: 'Features', to: '/features' },
  { label: 'Modules', to: '/modules' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Industries', to: '/industries' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'FAQ', to: '/faq' },
]

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  detail: string
}

export const FEATURES: Feature[] = [
  {
    icon: Target,
    title: 'CRM & Sales',
    description: 'Capture leads, log follow-ups, and convert prospects into signed projects without leaving the platform.',
    detail:
      'Every lead carries its source, budget, and follow-up history. Sales staff see only what they own; admins see the whole pipeline — from first call to signed contract.',
  },
  {
    icon: Building2,
    title: 'Project Delivery',
    description: 'Plan milestones, assign tasks, and track daily site progress with photo updates straight from the field.',
    detail:
      'Every project gets a unique ID that links tasks, expenses, labour, documents, and site reports together — so nothing lives in a disconnected spreadsheet.',
  },
  {
    icon: CreditCard,
    title: 'Finance & Invoicing',
    description: 'Track expenses, raise client invoices, and see budget vs. spend on every project in real time.',
    detail: 'Budget vs. actual spend updates automatically as expenses are logged — no month-end reconciliation surprises.',
  },
  {
    icon: FolderOpen,
    title: 'Document Management',
    description: 'Store drawings, permits, and contracts with secure cloud file storage — accessible from anywhere.',
    detail: 'Files are stored on real cloud infrastructure (Cloudflare R2), not in the browser — accessible from any device, any site.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description: 'Project Managers, Site Engineers, Accountants, and Sales teams each see exactly what they need — nothing more.',
    detail: 'Six built-in roles control what every teammate can see and do, down to individual modules — no spreadsheet permissions to manage.',
  },
  {
    icon: UploadCloud,
    title: 'Bulk Data Import',
    description: 'Migrate existing records in minutes with guided Excel templates for every module in the system.',
    detail: 'Download a template, fill in your existing records, and import — every module supports validated bulk import out of the box.',
  },
]

export const STEPS = [
  { title: 'Create your workspace', description: 'Sign up and set up your company profile in minutes.' },
  { title: 'Invite your team', description: 'Add Project Managers, Site Engineers, Accountants, and Sales staff with role-based access.' },
  { title: 'Run every project', description: 'Manage leads, estimates, site progress, materials, and contracts end-to-end.' },
  { title: 'Track it all', description: 'Real-time dashboards keep leadership and field teams on the same page.' },
]

export type BillingPeriod = 'monthly' | 'yearly'

export interface Plan {
  name: string
  /** Prices already formatted for display, per billing period. */
  price: Record<BillingPeriod, string>
  period: Record<BillingPeriod, string>
  /** Shown next to the yearly price on the toggle — omitted for plans with no yearly discount framing. */
  yearlyNote?: string
  maxUsers: string
  description: string
  features: string[]
  cta: { label: string; to?: string; href?: string }
  highlighted: boolean
}

// Real numbers — these match the live SubscriptionPlan rows created in the Super Admin Console
// (Billing → Plans), not just marketing copy. If pricing changes, update both places.
export const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: { monthly: '₹3,999', yearly: '₹39,990' },
    period: { monthly: '/month', yearly: '/year' },
    yearlyNote: '2 months free',
    maxUsers: 'Up to 5 users',
    description: 'For a solo contractor or small studio organizing leads, projects, and expenses in one place.',
    features: [
      'Up to 5 users',
      'Leads, Clients, Projects & Tasks',
      'Calendar & basic expense tracking',
      'Cloud document storage',
      'Excel import for every module',
      'Email support',
    ],
    cta: { label: 'Request Demo', to: '/request-demo' },
    highlighted: false,
  },
  {
    name: 'Growth',
    price: { monthly: '₹9,999', yearly: '₹99,990' },
    period: { monthly: '/month', yearly: '/year' },
    yearlyNote: '2 months free',
    maxUsers: 'Up to 20 users',
    description: 'For a business running real crews — site progress, resources, and finance, end to end.',
    features: [
      'Up to 20 users',
      'Everything in Starter, plus:',
      'Site Progress reports with photos',
      'Estimates/BOQ & Contracts',
      'Vendors, Labour, Inventory & Equipment',
      'Invoicing & Financial Reports',
      'Priority support',
    ],
    cta: { label: 'Request Demo', to: '/request-demo' },
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    period: { monthly: '', yearly: '' },
    maxUsers: 'Unlimited users',
    description: 'For large or multi-branch organizations that need scale and a dedicated relationship.',
    features: ['Unlimited users', 'Every module included', 'Dedicated onboarding', 'Custom integrations', 'SLA-backed support'],
    cta: { label: 'Contact Sales', href: 'mailto:sales@constructdesk.in' },
    highlighted: false,
  },
]

// Built directly from the real module catalog (lib/modules.ts) so this table can't drift from
// what's actually enforced by the backend's plan-based module gating.
export interface ComparisonRow {
  label: string
  starter: boolean
  growth: boolean
  enterprise: boolean
}

export interface ComparisonGroup {
  label: string
  rows: ComparisonRow[]
}

function inStarter(key: ModuleKey) {
  return (STARTER_MODULE_KEYS as readonly string[]).includes(key)
}

export const PRICING_COMPARISON_GROUPS: ComparisonGroup[] = [
  ...MODULE_GROUPS.filter((g) => g.label !== 'System').map((group) => ({
    label: group.label,
    rows: group.modules.map((m) => ({
      label: m.label,
      starter: inStarter(m.key),
      growth: true,
      enterprise: true,
    })),
  })),
  {
    label: 'Support',
    rows: [
      { label: 'Email support', starter: true, growth: true, enterprise: true },
      { label: 'Priority support', starter: false, growth: true, enterprise: true },
      { label: 'Dedicated onboarding', starter: false, growth: false, enterprise: true },
      { label: 'Custom integrations', starter: false, growth: false, enterprise: true },
    ],
  },
]

export const DIFFERENTIATORS = [
  {
    icon: ShieldCheck,
    title: 'Multi-tenant & secure',
    description: "Every company's data is fully isolated, with role-based access control down to individual modules.",
  },
  {
    icon: IndianRupee,
    title: 'Built for Indian businesses',
    description: 'GST fields, INR currency, and workflows shaped around how Indian construction and design businesses operate.',
  },
  {
    icon: Layers,
    title: 'One platform, two industries',
    description: "Switch your workspace's terminology between Construction and Interior Design without switching software.",
  },
  {
    icon: UploadCloud,
    title: 'Real cloud file storage',
    description: 'Site photos, drawings, and contracts stay securely stored and accessible from anywhere — not just your browser.',
  },
]

export interface Faq {
  question: string
  answer: string
  category: 'General' | 'Billing' | 'Data & Security'
}

export const FAQS: Faq[] = [
  {
    category: 'General',
    question: 'Is there a free trial?',
    answer: 'Yes — every new workspace starts on a trial period so you can explore every module before choosing a plan.',
  },
  {
    category: 'General',
    question: 'Does this work for interior design businesses too?',
    answer:
      'Yes — ConstructDesk supports both Construction and Interior Design workspaces, with terminology and project types tailored to each.',
  },
  {
    category: 'General',
    question: 'Can I import my existing data?',
    answer:
      'Yes. Every module supports bulk import via a guided Excel template with example rows and validation, so migrating existing records takes minutes, not weeks.',
  },
  {
    category: 'Data & Security',
    question: "Is my company's data isolated from other businesses?",
    answer:
      'Yes. ConstructDesk is fully multi-tenant — every project, lead, and document is scoped to your company and invisible to anyone outside it.',
  },
  {
    category: 'Data & Security',
    question: 'Where are my files stored?',
    answer: 'Photos, drawings, and contracts are stored on Cloudflare R2 — real cloud object storage, not your browser.',
  },
  {
    category: 'Billing',
    question: 'What happens if my subscription lapses?',
    answer:
      "You'll get a grace period before access pauses — your data is never deleted, and you can resume anytime by renewing your plan.",
  },
  {
    category: 'Billing',
    question: 'Can I change plans later?',
    answer: 'Yes — upgrade or downgrade anytime from Settings → Billing. Changes take effect on your next billing cycle.',
  },
]

export const HERO_PROJECT_ROWS = [
  { name: 'Lakeview Towers', status: 'in_progress' as keyof typeof STATUS_COLORS },
  { name: 'Prestige Business Park', status: 'planning' as keyof typeof STATUS_COLORS },
  { name: 'Whitefield Residency', status: 'completed' as keyof typeof STATUS_COLORS },
]
