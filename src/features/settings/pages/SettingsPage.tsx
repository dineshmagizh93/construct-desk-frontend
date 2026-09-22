import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { CreditCard } from 'lucide-react'
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
import { usePlans, useMyCompany, useUpdateMyCompany } from '../platformApi'

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
      </Tabs>
    </div>
  )
}
