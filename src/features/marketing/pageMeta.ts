const ORIGIN = 'https://constructdesk.in'

interface PageMeta {
  title: string
  description: string
}

/** What search engines and link previews show for each public page. Titles lead with the words people actually search for. */
export const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'Construction CRM Software for Contractors in India | ConstructDesk',
    description:
      'Construction CRM software for builders and contractors in India. Manage leads, projects, site progress, labour, materials, quotations and finance in one place.',
  },
  '/features': {
    title: 'Construction CRM Features: Leads, Projects, Site Progress | ConstructDesk',
    description:
      'Lead tracking, project management, daily site reports, labour, inventory, quotations, invoices and expense control for construction companies.',
  },
  '/modules': {
    title: 'CRM Modules for Construction Companies | ConstructDesk',
    description:
      'Leads, clients, projects, tasks, materials, equipment, labour, quotations, payments and reports, all connected through one project record.',
  },
  '/how-it-works': {
    title: 'How ConstructDesk Works: Get Your Construction CRM Live in 4 Steps',
    description:
      'Create a workspace, invite your team and start managing construction leads, projects and site work. No lengthy onboarding needed.',
  },
  '/pricing': {
    title: 'Construction CRM Pricing in India (INR) | ConstructDesk',
    description:
      'Simple monthly plans for construction CRM software in India. Compare Starter, Growth and Enterprise and start with a free trial.',
  },
  '/faq': {
    title: 'Construction CRM FAQ | ConstructDesk',
    description:
      'Answers about ConstructDesk: who it is for, what it manages, data security, pricing, trials, billing and support.',
  },
  '/request-demo': {
    title: 'Request a Demo of ConstructDesk Construction CRM',
    description: 'See ConstructDesk with your own projects. Request a demo and we will show how it fits your construction business.',
  },
  '/terms-of-service': { title: 'Terms of Service | ConstructDesk', description: 'The terms that apply when you use ConstructDesk.' },
  '/privacy-policy': { title: 'Privacy Policy | ConstructDesk', description: 'How ConstructDesk collects, uses and protects your data.' },
  '/refund-policy': { title: 'Refund Policy | ConstructDesk', description: 'ConstructDesk subscription cancellation and refund policy.' },
}

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value)
}

/** Keeps the title, description, canonical address and link-preview tags in step with the current public page. */
export function applyPageMeta(pathname: string): void {
  try {
    const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const meta = PAGE_META[clean]
    if (!meta) return
    const url = `${ORIGIN}${clean === '/' ? '/' : clean}`
    document.title = meta.title
    setMeta('meta[name="description"]', 'content', meta.description)
    setMeta('link[rel="canonical"]', 'href', url)
    setMeta('meta[property="og:title"]', 'content', meta.title)
    setMeta('meta[property="og:description"]', 'content', meta.description)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[name="twitter:title"]', 'content', meta.title)
    setMeta('meta[name="twitter:description"]', 'content', meta.description)
  } catch {
    // Search tags are never worth breaking a page for.
  }
}
