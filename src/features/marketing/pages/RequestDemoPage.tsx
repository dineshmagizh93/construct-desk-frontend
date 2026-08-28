import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

const NEXT = [
  'We read the form and book a 30–40 minute walkthrough.',
  'You see the modules that match your roles — not a generic slideshow.',
  'If it fits, we provision a workspace and send the admin login.',
]

export function RequestDemoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: '', email: '', phone: '', companyName: '', industry: 'construction', message: '' },
  })

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
        align="left"
        eyebrow="Request a demo"
        title="See ConstructDesk against a real project"
        description="Tell us about the business. We’ll walk the product the way your sites, studio, or accounts team would use it."
      />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <aside className="space-y-6">
            <h2 className="font-display text-xl font-semibold tracking-tight">What happens next</h2>
            <ol className="space-y-4">
              {NEXT.map((item, i) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-display text-xs font-semibold tracking-[0.14em] text-accent">0{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Prefer email? Write to{' '}
              <a href="mailto:sales@constructdesk.in" className="font-medium text-foreground underline underline-offset-4">
                sales@constructdesk.in
              </a>
            </div>
          </aside>

          {submitted ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <CheckCircle2 className="mx-auto size-10 text-foreground" />
              <h2 className="mt-4 font-display text-lg font-semibold">Thanks — we&apos;ve got your request</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Our team will reach out shortly to schedule your demo and get your workspace set up.
              </p>
            </div>
          ) : (
            <form className="space-y-4 rounded-2xl border border-border bg-card p-6 sm:p-8" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
                <Textarea
                  id="message"
                  placeholder="Team size, current tools, anything that helps us prepare…"
                  {...register('message')}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs leading-relaxed text-muted-foreground">
                By submitting, you agree to our{' '}
                <a href="/terms-of-service" className="underline underline-offset-2 hover:text-foreground">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
                  Privacy Policy
                </a>
                .
              </p>
              <Button type="submit" variant="accent" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Request Demo'}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
