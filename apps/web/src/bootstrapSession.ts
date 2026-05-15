import { authApi } from './api/auth'
import { useAuthStore } from './store/authStore'

let bootstrapPromise: Promise<void> | null = null

export function ensureSessionBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      try {
        const { accessToken } = await authApi.refresh()
        useAuthStore.getState().setToken(accessToken)
        const user = await authApi.me()
        useAuthStore.getState().setUser(user)
      } catch {
        useAuthStore.getState().setToken(null)
        useAuthStore.getState().setUser(null)
      } finally {
        useAuthStore.getState().setSessionChecked(true)
      }
    })()
  }
  return bootstrapPromise
}
