import { useEffect } from 'react'
import axios from 'axios'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ensureSessionBootstrapped } from './bootstrapSession'
import { Navbar } from './components/Navbar'
import { FloatingThemeToggle } from './components/FloatingThemeToggle'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { OAuthCallback } from './pages/auth/OAuthCallback'
import { Dashboard } from './pages/dashboard/Dashboard'
import { PollBuilder } from './pages/builder/PollBuilder'
import { RespondPage } from './pages/respond/RespondPage'
import { AnalyticsDashboard } from './pages/analytics/AnalyticsDashboard'
import { ResultsPage } from './pages/results/ResultsPage'
import { NotFound } from './pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 429 || error.response?.status === 401)
        ) {
          return false
        }
        return failureCount < 1
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

function useBootstrap() {
  useEffect(() => {
    if (window.location.pathname === '/auth/callback') {
      return
    }
    void ensureSessionBootstrapped()
  }, [])
}

function Shell({
  children,
  hideNavbar,
}: {
  children: React.ReactNode
  /** Skip the top Navbar (used by pages that already have a sidebar). */
  hideNavbar?: boolean
}) {
  return (
    <>
      {hideNavbar ? null : <Navbar />}
      {children}
      {hideNavbar ? <FloatingThemeToggle /> : null}
    </>
  )
}

export default function App() {
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useBootstrap()

  return (
    <GoogleOAuthProvider clientId={googleId}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              success: {
                style: {
                  background: 'var(--success-bg)',
                  color: 'var(--success-text)',
                  border: '0.5px solid var(--success-border)',
                },
              },
              error: {
                style: {
                  background: 'var(--danger-bg)',
                  color: 'var(--danger-text)',
                  border: '0.5px solid var(--danger-border)',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Shell children={<Landing />} />} />
            <Route path="/login" element={<Shell children={<Login />} />} />
            <Route path="/register" element={<Shell children={<Register />} />} />
            <Route
              path="/forgot-password"
              element={<Shell children={<ForgotPassword />} />}
            />
            <Route
              path="/reset-password"
              element={<Shell children={<ResetPassword />} />}
            />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Shell hideNavbar children={<Dashboard />} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/polls/new"
              element={
                <ProtectedRoute>
                  <Shell hideNavbar children={<PollBuilder />} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/polls/:id/edit"
              element={
                <ProtectedRoute>
                  <Shell hideNavbar children={<PollBuilder mode="edit" />} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/polls/:id/analytics"
              element={
                <ProtectedRoute>
                  <Shell hideNavbar children={<AnalyticsDashboard />} />
                </ProtectedRoute>
              }
            />
            <Route path="/p/:id" element={<RespondPage />} />
            <Route path="/p/:id/results" element={<ResultsPage />} />
            <Route path="*" element={<Shell children={<NotFound />} />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
