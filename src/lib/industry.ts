import type { SelectOption } from '@/components/shared/types'

export type Industry = 'construction' | 'interior_design'

export interface ModuleText {
  title: string
  description: string
  entityLabel?: string
}

export interface IndustryConfig {
  key: Industry
  label: string
  tagline: string
  navLabels: Record<string, string>
  moduleText: Record<'estimates' | 'siteProgress' | 'labour' | 'equipment' | 'inventory' | 'projects', ModuleText>
  projectTypeOptions: SelectOption[]
}

export const INDUSTRY_CONFIGS: Record<Industry, IndustryConfig> = {
  construction: {
    key: 'construction',
    label: 'Construction',
    tagline: 'Built for construction companies — sites, labour, materials, and civil works.',
    navLabels: {},
    moduleText: {
      projects: {
        title: 'Projects',
        description: 'Track every active, planned, and completed construction project.',
      },
      estimates: {
        title: 'Estimates & BOQ',
        description: 'Cost estimates and bills of quantities sent to prospective and existing clients.',
        entityLabel: 'estimate',
      },
      siteProgress: {
        title: 'Site Progress',
        description: 'Daily site reports — progress, workforce, and conditions across every project.',
        entityLabel: 'report',
      },
      labour: {
        title: 'Labour',
        description: 'Workforce roster across all sites — trades, contractors, and daily wages.',
        entityLabel: 'worker',
      },
      equipment: {
        title: 'Equipment & Machinery',
        description: 'Track allocation, usage, and maintenance schedules for every asset.',
        entityLabel: 'equipment',
      },
      inventory: {
        title: 'Inventory & Materials',
        description: 'Stock levels for materials across every active site.',
        entityLabel: 'material',
      },
    },
    projectTypeOptions: [
      { label: 'Residential', value: 'Residential' },
      { label: 'Commercial', value: 'Commercial' },
      { label: 'Infrastructure', value: 'Infrastructure' },
      { label: 'Industrial', value: 'Industrial' },
    ],
  },
  interior_design: {
    key: 'interior_design',
    label: 'Interior Design',
    tagline: 'Built for interior design studios — projects, quotations, furnishings, and execution.',
    navLabels: {
      '/estimates': 'Estimates & Quotations',
      '/site-progress': 'Execution Progress',
      '/labour': 'Labour & Contractors',
      '/equipment': 'Tools & Equipment',
      '/inventory': 'Materials & Furnishings',
    },
    moduleText: {
      projects: {
        title: 'Projects',
        description: 'Track every active, planned, and completed design project.',
      },
      estimates: {
        title: 'Estimates & Quotations',
        description: 'Cost quotations and proposals sent to prospective and existing clients.',
        entityLabel: 'quotation',
      },
      siteProgress: {
        title: 'Execution Progress',
        description: 'Daily execution reports — progress, workforce, and site conditions across every project.',
        entityLabel: 'report',
      },
      labour: {
        title: 'Labour & Contractors',
        description: 'Workforce roster across all studios and sites — trades, contractors, and daily wages.',
        entityLabel: 'worker',
      },
      equipment: {
        title: 'Tools & Equipment',
        description: 'Track allocation, usage, and maintenance schedules for every tool and asset.',
        entityLabel: 'equipment',
      },
      inventory: {
        title: 'Materials & Furnishings',
        description: 'Stock levels for furniture, fabrics, decor, and finishing materials across every project.',
        entityLabel: 'item',
      },
    },
    projectTypeOptions: [
      { label: 'Residential Interior', value: 'Residential Interior' },
      { label: 'Commercial Interior', value: 'Commercial Interior' },
      { label: 'Office Interior', value: 'Office Interior' },
      { label: 'Retail Interior', value: 'Retail Interior' },
      { label: 'Hospitality Interior', value: 'Hospitality Interior' },
    ],
  },
}
