'use client'

// ============================================================
// Task 6-a — Authentication screen (login / register)
// Single card, inline validation, demo fill helper.
// Internal navigation goes through the zustand store only.
// ============================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Chrome, Eye, EyeOff, Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { useApp } from '@/lib/store'
import { api } from '@/lib/api'
import type { EventRecord, SessionUser } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

export default function AuthScreen() {
  const authMode = useApp((s) => s.authMode)
  const openAuth = useApp((s) => s.openAuth)
  const setView = useApp((s) => s.setView)
  const setUser = useApp((s) => s.setUser)
  const setEvents = useApp((s) => s.setEvents)

  const isLogin = authMode === 'login'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const errs: FieldErrors = {}
    if (!isLogin && !name.trim()) errs.name = 'Please enter your name'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!EMAIL_RE.test(email.trim())) errs.email = 'Please enter a valid email address'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const clearError = (key: keyof FieldErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !validate()) return
    setLoading(true)
    try {
      const path = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin ? { email, password } : { name, email, password }
      const { user } = await api<{ user: SessionUser }>(path, { body })

      setUser(user)

      let events: EventRecord[] = []
      try {
        const d = await api<{ events: EventRecord[] }>('/api/events')
        events = d.events ?? []
      } catch {
        // non-fatal — treat as no events
      }
      setEvents(events)

      if (!isLogin || events.length === 0) {
        setView('onboarding')
      } else {
        setView('app')
      }

      const firstName = user.name.split(' ')[0]
      toast.success(isLogin ? `Welcome back, ${firstName}!` : `Account created — welcome, ${firstName}!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setErrors({})
    openAuth(isLogin ? 'register' : 'login')
  }

  const fillDemo = () => {
    setName('John Carter')
    setEmail('john@example.com')
    setPassword('demo1234')
    setErrors({})
    toast.info('Demo credentials filled — press Sign in')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* decorative warm blobs */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[#9A7B5B]/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-[#C9A96A]/10 blur-3xl" />

      <button
        type="button"
        onClick={() => setView('marketing')}
        className="absolute left-4 top-4 flex min-h-[44px] items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-stone-200/60 sm:p-8">
          {/* logo */}
          <div className="flex flex-col items-center text-center">
            <span
              className="flex size-12 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ backgroundColor: '#9A7B5B' }}
            >
              <Heart className="size-5 fill-current" aria-hidden />
            </span>
            <span className="mt-3 text-sm font-semibold tracking-tight">Online RSVP</span>
          </div>

          <h1 className="font-display mt-6 text-center text-3xl font-semibold tracking-tight">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {isLogin
              ? 'Sign in to manage your events and RSVPs.'
              : 'Start planning your event in less than two minutes.'}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="auth-name">Full name</Label>
                <Input
                  id="auth-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    clearError('name')
                  }}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  className="h-11"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  clearError('email')
                }}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password">Password</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() =>
                      toast.info('Password reset is disabled in this demo — use john@example.com / demo1234')
                    }
                    className="rounded px-1 text-xs font-medium text-[#9A7B5B] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearError('password')
                  }}
                  placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="h-11 pr-11"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </>
              ) : isLogin ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          {/* demo hint */}
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border bg-muted/70 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">
              Demo account: <span className="font-medium text-foreground">john@example.com / demo1234</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 text-[#9A7B5B]"
              onClick={fillDemo}
            >
              Fill
            </Button>
          </div>

          {/* divider */}
          <div className="my-5 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={() => toast.info('Google OAuth is not configured in this demo')}
          >
            <Chrome className="size-4" aria-hidden />
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="rounded font-semibold text-[#9A7B5B] hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
