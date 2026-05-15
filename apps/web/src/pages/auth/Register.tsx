import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { GoogleIcon } from '../../components/GoogleIcon'
import { Card } from '../../components/Card'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

type FormValues = z.infer<typeof schema>

export function Register() {
  const { register: registerUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      await registerUser(values.email, values.password, values.name)
      toast.success('Account created')
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error(e.response?.data?.error ?? 'Registration failed')
      } else {
        toast.error('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const googleHref = `${import.meta.env.VITE_API_URL}/api/auth/google`

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 bg-bg-page">
      <Card className="w-full max-w-md shadow-lg rounded-xl p-8 bg-bg-elevated border-border">
        <div className="flex justify-center mb-6">
          <span className="inline-flex h-10 w-10 rounded-md bg-brand items-center justify-center text-txt-inverse font-bold">
            P
          </span>
        </div>
        <a
          href={googleHref}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-border bg-bg-surface hover:bg-bg-subtle transition-colors text-sm font-medium text-txt-primary"
          aria-label="Continue with Google"
        >
          <GoogleIcon />
          Continue with Google
        </a>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-txt-tertiary">
            or continue with email
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Name"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            aria-label="Create account"
          >
            Create account
          </Button>
        </form>

        <p className="text-sm text-txt-secondary text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:text-brand-hover font-medium">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  )
}
