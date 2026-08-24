import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import { openRazorpayCheckout } from '@/lib/razorpay'
import { usePlans, useSubscribe, refreshMyCompany } from '../../settings/platformApi'

export function PaywallPage() {
  const { user, company } = useAuth()
  const navigate = useNavigate()
  const { data: plans = [], isLoading } = usePlans()
  const subscribeMutation = useSubscribe()
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null)

  const subscribe = async (planId: string) => {
    setSubscribingPlanId(planId)
    try {
      const { subscriptionId, razorpayKeyId } = await subscribeMutation.mutateAsync(planId)
      await openRazorpayCheckout({
        keyId: razorpayKeyId,
        subscriptionId,
        name: 'ConstructDesk',
        description: 'Subscription payment',
        prefillEmail: user?.email,
      })
      await refreshMyCompany()
      toast({ title: 'Subscription active', description: 'Thanks! Your workspace is now unlocked.', variant: 'success' })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast({
        title: 'Payment not completed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubscribingPlanId(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="mb-6 text-center">
        <ShieldCheck className="mx-auto mb-3 size-8 text-primary" />
        <h1 className="text-xl font-semibold">Your subscription has lapsed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {company?.name ?? 'Your workspace'} needs an active plan to keep using ConstructDesk. Pick a plan below to
          continue — your data is safe and nothing has been deleted.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No plans are available yet — please contact your ConstructDesk administrator.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  <Badge variant="secondary">{plan.billingInterval === 'monthly' ? 'Monthly' : 'Yearly'}</Badge>
                </CardTitle>
                <CardDescription>{formatCurrency(plan.priceInPaise / 100)} / {plan.billingInterval === 'monthly' ? 'mo' : 'yr'}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  disabled={subscribingPlanId === plan.id}
                  onClick={() => subscribe(plan.id)}
                >
                  <CreditCard className="size-4" />
                  {subscribingPlanId === plan.id ? 'Opening checkout…' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
