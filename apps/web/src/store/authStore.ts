import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  sessionChecked: boolean
  setSessionChecked: (done: boolean) => void
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  logout: () => void
  isAuthed: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  sessionChecked: false,
  setSessionChecked: (done) => set({ sessionChecked: done }),
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  logout: () => {
    set({ token: null, user: null })
    void fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  },
  isAuthed: () => !!get().token,
}))
