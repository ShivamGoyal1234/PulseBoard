import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    if (!axios.isAxiosError(err)) return Promise.reject(err)
    const original = err.config
    if (!original) return Promise.reject(err)
    const status = err.response?.status
    const retryKey = '_retry' as const
    const alreadyRetried = Boolean(
      (original as typeof original & { _retry?: boolean })[retryKey]
    )
    if (status === 401 && !alreadyRetried) {
      const url = original.url ?? ''
      if (url.includes('/auth/refresh')) {
        return Promise.reject(err)
      }
      const cfg = original as typeof original & { _retry?: boolean }
      cfg._retry = true
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        )
        useAuthStore.getState().setToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(original)
      } catch {
        useAuthStore.getState().logout()
        const path = window.location.pathname
        if (path !== '/login' && path !== '/register' && path !== '/auth/callback') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)
