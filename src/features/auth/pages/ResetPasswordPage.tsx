import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '../api'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type FormValues = z.infer<typeof schema>

// Supabase redirects here after the recovery email link, with the tokens in the URL hash:
//   #access_token=...&type=recovery&refresh_token=...
function useRecoveryToken() {
  return useMemo(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    const params = new URLSearchParams(hash)
    return params.get('access_token')
  }, [])
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const accessToken = useRecoveryToken()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    if (!accessToken) return
    setError(null)
    try {
      await resetPassword(accessToken, values.password)
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password')
    }
  }

  if (!accessToken) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-semibold">Invalid or expired link</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This password reset link is no longer valid. Please request a new one.
        </p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm text-primary hover:underline">
          Request a new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h1 className="mt-4 text-xl font-semibold">Password updated</h1>
        <p className="mt-1 text-sm text-muted-foreground">Redirecting you to sign in…</p>
        <Link to="/login" className="mt-6 inline-block text-sm text-primary hover:underline">
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Set a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" placeholder="••••••••" {...register('confirm')} />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
