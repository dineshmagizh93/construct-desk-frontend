import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { http } from '@/lib/http'
import { PageHero } from '../components/shared'

interface FormValues {
  name: string
  email: string
  phone: string
  companyName: string
  industry: 'construction' | 'interior_design'
  message: string
}

export function RequestDemoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { name: '', email: '', phone: '', companyName: '', industry: 'construction', message: '' } })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await http('/demo-requests', { method: 'POST', body: JSON.stringify(values) })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Request a demo"
        title="See ConstructDesk in action"
        description="Tell us a bit about your business — our team will reach out to set up a walkthrough and get your workspace ready."
      />

      <section className="mx-auto max-w-lg px-6 pb-16">
        {submitted ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <CheckCircle2 className="size-10 text-success" />
              <h2 className="text-lg font-semibold">Thanks — we've got your request</h2>
              <p className="text-sm text-muted-foreground">
                Our team will reach out shortly to schedule your demo and get your workspace set up.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Your name" {...register('name', { required: true })} />
                  {errors.name && <p className="text-xs text-destructive">Name is required.</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" type="email" placeholder="you@company.com" {...register('email', { required: true })} />
                  {errors.email && <p className="text-xs text-destructive">Email is required.</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+91 98765 43210" {...register('phone', { required: true })} />
                  {errors.phone && <p className="text-xs text-destructive">Phone is required.</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input id="companyName" placeholder="Your company" {...register('companyName', { required: true })} />
                  {errors.companyName && <p className="text-xs text-destructive">Company name is required.</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Select value={watch('industry')} onValueChange={(v) => setValue('industry', v as FormValues['industry'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="interior_design">Interior Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">What are you looking for? (optional)</Label>
                  <Textarea id="message" placeholder="Team size, current tools, anything that helps us prepare…" {...register('message')} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Request Demo'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  )
}
