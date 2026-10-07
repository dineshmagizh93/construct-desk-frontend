import { useState, type FormEvent } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/features/auth/store'
import { toast } from '@/hooks/use-toast'
import { http } from '@/lib/http'
import { ROLE_LABELS } from '@/lib/constants'
import type { User } from '@/types'
import { passwordChangeError } from '../password'

function ProfileCard() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [saving, setSaving] = useState(false)

  if (!user) return null
  const unchanged = firstName.trim() === user.firstName && lastName.trim() === user.lastName

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (saving || unchanged || !firstName.trim() || !lastName.trim()) return
    setSaving(true)
    try {
      const result = await http<{ user: User }>('/auth/me', { method: 'PUT', body: JSON.stringify({ firstName, lastName }) })
      setUser(result.user)
      toast({ title: 'Profile updated', variant: 'success' })
    } catch (error) {
      toast({ title: 'Could not update your profile', description: error instanceof Error ? error.message : undefined, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your profile</CardTitle>
        <CardDescription>{user.companyRoleName ?? ROLE_LABELS[user.role]}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={save}>
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={60} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={60} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} readOnly disabled />
            <p className="text-xs text-muted-foreground">Your sign-in email can only be changed by an administrator.</p>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving || unchanged || !firstName.trim() || !lastName.trim()}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordCard() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (saving) return
    const problem = passwordChangeError(current, next, confirm)
    setError(problem)
    if (problem) return
    setSaving(true)
    try {
      await http('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: current, newPassword: next }) })
      setCurrent('')
      setNext('')
      setConfirm('')
      toast({ title: 'Password changed', description: 'Use your new password the next time you sign in.', variant: 'success' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change your password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>You need your current password to set a new one.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid max-w-md grid-cols-1 gap-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Changing…' : 'Change password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/** Open to every signed-in user (unlike Settings, which is for administrators): their own name and password. */
export function AccountPage() {
  return (
    <div>
      <PageHeader title="My account" description="Your name and sign-in password." />
      <div className="space-y-4">
        <ProfileCard />
        <PasswordCard />
      </div>
    </div>
  )
}
