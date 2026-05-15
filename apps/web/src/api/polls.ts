import { apiClient } from './client'
import type { Poll, Analytics } from '../types'

export interface CreatePollInput {
  title: string
  description?: string
  expiresAt: string
  isAnonymous: boolean
  showResults: boolean
  questions: {
    text: string
    isRequired: boolean
    order: number
    options: { text: string; order: number }[]
  }[]
}

export const pollsApi = {
  list: () =>
    apiClient.get<{ polls: Poll[] }>('/polls').then((r) => r.data.polls),

  get: (id: string) => apiClient.get<Poll>(`/polls/${id}`).then((r) => r.data),

  create: (data: CreatePollInput) =>
    apiClient.post<Poll>('/polls', data).then((r) => r.data),

  update: (
    id: string,
    data: Partial<Omit<CreatePollInput, 'questions'>> & { isActive?: boolean }
  ) => apiClient.patch<Poll>(`/polls/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/polls/${id}`),

  publish: (id: string) => apiClient.post(`/polls/${id}/publish`),

  getAnalytics: (id: string) =>
    apiClient.get<Analytics>(`/polls/${id}/analytics`).then((r) => r.data),

  getResults: (id: string) =>
    apiClient
      .get<Analytics & { poll?: { title: string; description?: string } }>(
        `/polls/${id}/results`
      )
      .then((r) => r.data),

  getInsights: (id: string, opts?: { force?: boolean }) =>
    apiClient
      .get<{ insight: string }>(`/polls/${id}/insights`, {
        params: opts?.force ? { force: 'true' } : undefined,
      })
      .then((r) => r.data),

  generateDraft: (prompt: string) =>
    apiClient
      .post<{
        title: string
        description?: string
        questions: {
          text: string
          isRequired: boolean
          options: { text: string }[]
        }[]
      }>('/polls/generate', { prompt })
      .then((r) => r.data),

  getDLQStats: (id: string) =>
    apiClient
      .get<{ failed: number; processed: number; pending: number }>(
        `/polls/${id}/dlq-stats`
      )
      .then((r) => r.data),

  replayDLQ: (id: string) =>
    apiClient.post<{ replayed: number }>(`/polls/${id}/dlq-replay`).then((r) => r.data),
}
