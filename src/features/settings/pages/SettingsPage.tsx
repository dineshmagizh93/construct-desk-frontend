import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ShieldCheck, CreditCard, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { INDUSTRY_CONFIGS, type Industry } from '@/lib/industry'
import type { Company } from '@/types'
import {
  useCompanies,
  useUpdateCompanyIndustry,
  usePlans,
  useCreatePlan,
  useTogglePlanActive,
  useMyCompany,
  useUpdateMyCompany,
} from '../platformApi'

interface CompanyForm {
  name: string
  address: string
  phone: string
  email: string
  gstNumber: string
}

function IndustryPicker({ company }: { company: Company }) {
  const updateIndustry = useUpdateCompanyIndustry()
  const [pendingIndustry, setPendingIndustry] = useState<Industry | null>(null)

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.keys(INDUSTRY_CONFIGS) as Industry[]).map((key) => {
          const config = INDUSTRY_CONFIGS[key]
          const active = company.industry === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => !active && setPendingIndustry(key)}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                active ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{config.label}</span>
                {active && <Badge variant="success">Active</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{config.tagline}</p>
            </button>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!pendingIndustry}
        onOpenChange={(open) => !open && setPendingIndustry(null)}
        title={`Switch ${company.name} to ${pendingIndustry ? INDUSTRY_CONFIGS[pendingIndustry].label : ''}?`}
        description="This immediately changes module labels and terminology for every user at this company. It does not rewrite any existing records."
        confirmLabel="Switch industry"
        destructive={false}
        onConfirm={async () => {
          if (!pendingIndustry) return
          await updateIndustry.mutateAsync({ id: company.id, industry: pendingIndustry })
          toast({
            title: 'Industry switched',
            description: `${company.name} is now running in ${INDUSTRY_CONFIGS[pendingIndustry].label} mode.`,
            variant: 'success',
          })
        }}
      />
    </div>
  )
}

function PlatformTab() {
  const { data: companies = [], isLoading } = useCompanies()
  const { data: plans = [] } = usePlans()
  const createPlan = useCreatePlan()
  const togglePlan = useTogglePlanActive()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ name: string; price: number; billingInterval: 'monthly' | 'yearly' }>({
    defaultValues: { name: '', price: 0, billingInterval: 'monthly' },
  })

  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) setSelectedCompanyId(companies[0].id)
  }, [companies, selectedCompanyId])

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" /> Companies & Industry Mode
          </CardTitle>
          <CardDescription>
            Industry is a per-company setting. Regular users — including company Admins — cannot change it; it's
            restricted to Super Admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-[220px_1fr]">
          <div className="space-y-1">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCompanyId(c.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm',
                  selectedCompanyId === c.id ? 'bg-secondary font-medium' : 'hover:bg-secondary/50',
                )}
              >
                <span className="truncate">{c.name}</span>
                <Badge variant={c.subscriptionStatus === 'active' || c.subscriptionStatus === 'trialing' ? 'success' : 'destructive'}>
                  {c.subscriptionStatus}
                </Badge>
              </button>
            ))}
            {!isLoading && companies.length === 0 && <p className="text-sm text-muted-foreground">No companies yet.</p>}
          </div>
          <div>{selectedCompany ? <IndustryPicker company={selectedCompany} /> : <p className="text-sm text-muted-foreground">Select a company.</p>}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="size-4" /> Subscription Plans
            </span>
            <Button size="sm" variant="outline" onClick={() => setShowPlanForm((v) => !v)}>
              <Plus className="size-3.5" /> Add Plan
            </Button>
          </CardTitle>
          <CardDescription>Plans companies can subscribe to via Razorpay.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {showPlanForm && (
            <form
              className="grid grid-cols-1 gap-3 rounded-md border border-dashed border-border p-3 sm:grid-cols-4"
              onSubmit={handleSubmit(async (values) => {
                await createPlan.mutateAsync({
                  name: values.name,
                  priceInPaise: Math.round(Number(values.price) * 100),
                  billingInterval: values.billingInterval,
                })
                reset()
                setShowPlanForm(false)
                toast({ title: 'Plan created', variant: 'success' })
              })}
            >
              <Input placeholder="Plan name" {...register('name', { required: true })} />
              <Input type="number" placeholder="Price (INR)" {...register('price', { required: true, valueAsNumber: true })} />
              <select className="rounded-md border border-border bg-background px-2 text-sm" {...register('billingInterval')}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <Button type="submit" size="sm">Create</Button>
            </form>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{formatCurrency(plan.priceInPaise / 100)}</TableCell>
                  <TableCell className="capitalize">{plan.billingInterval}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? 'success' : 'secondary'}>{plan.isActive ? 'Active' : 'Disabled'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePlan.mutateAsync({ id: plan.id, isActive: !plan.isActive })}
                    >
                      {plan.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No plans yet — add one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function BillingTab() {
  const { data: company } = useMyCompany()
  const { data: plans = [] } = usePlans()
  const navigate = useNavigate()

  const currentPlan = plans.find((p) => p.id === company?.subscriptionPlanId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-4" /> Subscription
        </CardTitle>
        <CardDescription>Manage your workspace's ConstructDesk subscription.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div>
            <p className="text-sm font-medium">{currentPlan?.name ?? 'No plan selected'}</p>
            <p className="text-xs text-muted-foreground">
              Status: <Badge variant={company?.subscriptionStatus === 'active' || company?.subscriptionStatus === 'trialing' ? 'success' : 'destructive'}>{company?.subscriptionStatus}</Badge>
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/billing/paywall')}>
            {currentPlan ? 'Change plan' : 'Choose a plan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SettingsPage() {
  const { user, company } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const { data: myCompany } = useMyCompany(!isSuperAdmin)
  const updateMyCompany = useUpdateMyCompany()

  const { register, handleSubmit, reset } = useForm<CompanyForm>({
    defaultValues: { name: '', address: '', phone: '', email: '', gstNumber: '' },
  })

  useEffect(() => {
    if (myCompany) {
      reset({
        name: myCompany.name,
        address: myCompany.address ?? '',
        phone: myCompany.phone ?? '',
        email: myCompany.email ?? '',
        gstNumber: myCompany.gstNumber ?? '',
      })
    }
  }, [myCompany, reset])

  const onSubmit = async (values: CompanyForm) => {
    await updateMyCompany.mutateAsync(values)
    toast({ title: 'Settings saved', description: 'Company profile updated successfully.', variant: 'success' })
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your company profile and billing." />

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          {!isSuperAdmin && company && <TabsTrigger value="billing">Billing</TabsTrigger>}
          {isSuperAdmin && <TabsTrigger value="platform">Platform</TabsTrigger>}
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" {...register('name')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register('phone')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input id="gstNumber" {...register('gstNumber')} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Registered Address</Label>
                  <Textarea id="address" {...register('address')} />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {!isSuperAdmin && company && (
          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>
        )}

        {isSuperAdmin && (
          <TabsContent value="platform">
            <PlatformTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
