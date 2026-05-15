import { apiClient } from './client'

export interface SubmitInput {
  answers: { questionId: string; optionId: string }[]
  timeToComplete?: number
}

export interface SubmitResponse {
  responseId: string
  showResults: boolean
  pollId: string
}

export const responsesApi = {
  submit: (pollId: string, data: SubmitInput, fingerprint: string) =>
    apiClient
      .post<SubmitResponse>(`/polls/${pollId}/responses`, data, {
        headers: { 'X-Fingerprint': fingerprint },
      })
      .then((r) => r.data),
}
