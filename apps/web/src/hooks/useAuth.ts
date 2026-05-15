import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'

export function useAuth() {
  const { token, user, setToken, setUser, logout: storeLogout, isAuthed } =
    useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(
    async (email: string, password: string) => {
      const { accessToken } = await authApi.login(email, password)
      setToken(accessToken)
      const me = await authApi.me()
      setUser(me)
      navigate('/dashboard')
    },
    [navigate, setToken, setUser]
  )

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const { accessToken } = await authApi.register(email, password, name)
      setToken(accessToken)
      const me = await authApi.me()
      setUser(me)
      navigate('/dashboard')
    },
    [navigate, setToken, setUser]
  )

  const logout = useCallback(async () => {
    storeLogout()
    navigate('/')
    toast.success('Signed out')
  }, [navigate, storeLogout])

  return { token, user, login, register, logout, isAuthed }
}
