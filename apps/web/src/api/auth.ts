import { apiClient } from './client'
import type { User } from '../types'

export const authApi = {
  register: (email: string, password: string, name: string) =>
    apiClient
      .post<{ accessToken: string }>('/auth/register', {
        email,
        password,
        name,
      })
      .then((r) => r.data),

  login: (email: string, password: string) =>
    apiClient
      .post<{ accessToken: string }>('/auth/login', { email, password })
      .then((r) => r.data),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<{ user: User }>('/auth/me').then((r) => r.data.user),

  refresh: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh').then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post<{ ok: boolean; message: string }>('/auth/forgot-password', {
      email,
    }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    apiClient.post<{ ok: boolean }>('/auth/reset-password', { token, password }).then(
      (r) => r.data
    ),
}
