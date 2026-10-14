import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { CreditCard, Download } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { subscriptionAccess } from '@/features/billing/access'
import { formatDate } from '@/lib/utils'
import { usePlans, useMyCompany, useUpdateMyCompany, useCancelSubscription, refreshMyCompany } from '../platformApi'
import { describeCounts, downloadCompanyData } from '../exportData'

interface CompanyForm {
  name: string
  address: string
  phone: string
  email: string
  gstNumber: string
}

function BillingTab() {
  const { data: company } = useMyCompany()
  const { data: plans = [] } = usePlans()
  const navigate = useNavigate()

  const cancelSubscription = useCancelSubscription()
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const currentPlan = plans.find((p) => p.id === company?.subscriptionPlanId)
  const access = company ? subscriptionAccess(company) : null
  // Only a customer paying through Razorpay has something to cancel; a trial or a plan set up by hand does not.
  const canCancel = !!company?.razorpaySubscriptionId && company.subscriptionStatus === 'active' && !company.cancelAtPeriodEnd
  // A second subscription beside a running one would bill twice, so switching plans goes through cancelling first.
  const canChoosePlan = !canCancel

  const statusLabel =
    access?.state === 'ending'
      ? `Cancelled · open until ${formatDate(access.endsAt)}`
      : access?.state === 'grace'
        ? `Payment failed · open until ${formatDate(access.endsAt)}`
        : company?.subscriptionStatus === 'trialing' && access?.endsAt
          ? `Free trial · ends ${formatDate(access.endsAt)}`
          : company?.subscriptionStatus === 'active'
            ? 'Active'
            : company?.subscriptionStatus === 'past_due'
              ? 'Payment overdue'
              : company?.subscriptionStatus === 'cancelled'
                ? 'Cancelled'
                : company?.subscriptionStatus

  const cancel = async () => {
    try {
      const result = await cancelSubscription.mutateAsync()
      await refreshMyCompany()
      toast({
        title: 'Subscription cancelled',
        description: result.currentPeriodEnd ? `You can keep using ConstructDesk until ${formatDate(result.currentPeriodEnd)}. You will not be charged again.` : 'You will not be charged again.',
        variant: 'success',
      })
    } catch (error) {
      toast({ title: 'Could not cancel', description: error instanceof Error ? error.message : undefined, variant: 'destructive' })
    }
  }

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
              Status: <Badge variant={access?.allowed && access.state !== 'grace' ? 'success' : 'destructive'}>{statusLabel}</Badge>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canCancel && (
              <Button size="sm" variant="outline" onClick={() => setConfirmingCancel(true)}>
                Cancel subscription
              </Button>
            )}
            {canChoosePlan && (
              <Button size="sm" onClick={() => navigate('/billing/paywall')}>
                {currentPlan ? 'Change plan' : 'Choose a plan'}
              </Button>
            )}
          </div>
        </div>
        {canCancel && (
          <p className="text-xs text-muted-foreground">
            Cancelling stops future charges. You keep full access until the end of the period you have paid for. To switch to a different plan, cancel first and then choose the new one.
          </p>
        )}
        <ConfirmDialog
          open={confirmingCancel}
          onOpenChange={setConfirmingCancel}
          title="Cancel your subscription?"
          description={`You will not be charged again, and ${company?.name ?? 'your workspace'} stays available until ${formatDate(company?.currentPeriodEnd)}. Your data is kept, and you can subscribe again any time.`}
          confirmLabel="Cancel subscription"
          onConfirm={cancel}
        />
      </CardContent>
    </Card>
  )
}

function DataTab() {
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  const download = async () => {
    if (busy) return
    setBusy(true)
    try {
      const result = await downloadCompanyData()
      setSummary(describeCounts(result.counts) || 'No records yet — the file contains your company details and users only.')
      toast({ title: 'Download ready', description: 'Your data was saved as a JSON file.', variant: 'success' })
    } catch (error) {
      toast({ title: 'Could not download your data', description: error instanceof Error ? error.message : undefined, variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download your data</CardTitle>
        <CardDescription>
          A complete copy of everything in your account — leads, clients, projects, tasks, estimates, contracts, invoices and payments, expenses, vendors, stock, equipment, labour, site
          progress, safety, documents (names and links) and your team list — as one JSON file. Passwords are never included.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={download} disabled={busy}>
          <Download className="size-4" /> {busy ? 'Preparing…' : 'Download all my data'}
        </Button>
        {summary && <p className="text-sm text-muted-foreground">Saved: {summary}</p>}
        <p className="text-xs text-muted-foreground">You can download up to 5 times an hour. Only administrators can do this.</p>
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
          {!isSuperAdmin && company && user?.role === 'admin' && <TabsTrigger value="data">Your data</TabsTrigger>}
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

        {!isSuperAdmin && company && user?.role === 'admin' && (
          <TabsContent value="data">
            <DataTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
