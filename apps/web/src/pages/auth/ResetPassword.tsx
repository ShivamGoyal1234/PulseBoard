import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import axios from 'axios'
import { authApi } from '../../api/auth'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card } from '../../components/Card'

const schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine(
    (d: { password: string; confirm: string }) => d.password === d.confirm,
    {
      message: 'Passwords must match',
      path: ['confirm'],
    }
  )

type FormValues = z.infer<typeof schema>

export function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    if (!token || token.length < 32) {
      toast.error('Invalid or missing reset link')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword(token, values.password)
      toast.success('Password updated — sign in with your new password')
      navigate('/login', { replace: true })
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error(e.response?.data?.error ?? 'Reset failed')
      } else {
        toast.error('Reset failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 bg-bg-page">
      <Card className="w-full max-w-md shadow-lg rounded-xl p-8 bg-bg-elevated border-border">
        <div className="flex justify-center mb-6">
          <span className="inline-flex h-10 w-10 rounded-md bg-brand items-center justify-center text-txt-inverse font-bold">
            P
          </span>
        </div>
        <h1 className="text-lg font-semibold text-txt-primary text-center mb-6">
          Choose a new password
        </h1>

        {!token ? (
          <p className="text-sm text-danger-text text-center">
            This link is invalid. Request a new reset from{' '}
            <Link to="/forgot-password" className="text-brand underline">
              forgot password
            </Link>
            .
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={errors.confirm?.message}
              {...register('confirm')}
            />
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              aria-label="Update password"
            >
              Update password
            </Button>
          </form>
        )}

        <p className="text-sm text-txt-secondary text-center mt-6">
          <Link to="/login" className="text-brand hover:text-brand-hover font-medium">
            Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
