import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import axios from 'axios'
import { authApi } from '../../api/auth'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card } from '../../components/Card'

const schema = z.object({
  email: z.string().email(),
})

type FormValues = z.infer<typeof schema>

export function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(values.email)
      setSent(true)
      toast.success('Check your email')
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error(e.response?.data?.error ?? 'Something went wrong')
      } else {
        toast.error('Something went wrong')
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
        <h1 className="text-lg font-semibold text-txt-primary text-center mb-2">
          Reset password
        </h1>
        <p className="text-sm text-txt-secondary text-center mb-6">
          Enter your email and we&apos;ll send a link if an account exists.
        </p>

        {sent ? (
          <p className="text-sm text-txt-secondary text-center">
            If an account exists for that email, you&apos;ll receive reset
            instructions shortly.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              aria-label="Send reset link"
            >
              Send reset link
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
