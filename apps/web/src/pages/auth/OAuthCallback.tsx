import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth'
import { Skeleton } from '../../components/Skeleton'

export function OAuthCallback() {
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)
  const setSessionChecked = useAuthStore((s) => s.setSessionChecked)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) {
      setSessionChecked(true)
      navigate('/login?error=oauth', { replace: true })
      return
    }
    setToken(token)
    setSessionChecked(true)
    window.history.replaceState({}, document.title, '/auth/callback')
    authApi
      .me()
      .then((user) => setUser(user))
      .finally(() => navigate('/dashboard', { replace: true }))
  }, [navigate, setSessionChecked, setToken, setUser])

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4">
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    </div>
  )
}
