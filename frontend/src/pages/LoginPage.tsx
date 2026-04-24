import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks'
import { mapApiError } from '../lib/api/error'
import { loginSchema, type LoginFormValues } from '../lib/validators/auth'

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })
  if (user) return <Navigate to={user.role === 'CASHIER' ? '/pos' : '/dashboard'} replace />

  return (
    <div className="mx-auto mt-24 w-full max-w-md rounded border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold">Sign in</h1>
      <form
        className="space-y-3"
        onSubmit={handleSubmit(async (values) => {
          setError(null)
          try {
            await login(values)
            navigate('/dashboard')
          } catch (err) {
            setError(mapApiError(err))
          }
        })}
      >
        <label className="block text-sm">
          <span className="mb-1 block">Email</span>
          <input {...register('email')} className="w-full rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block">Password</span>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {formState.isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
