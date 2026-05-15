export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  provider: 'email' | 'google'
  createdAt: string
}

interface Option {
  id: string
  text: string
  order: number
}

export interface Question {
  id: string
  pollId: string
  text: string
  isRequired: boolean
  order: number
  options: Option[]
}

export interface Poll {
  id: string
  title: string
  description?: string
  creatorId?: string
  isAnonymous: boolean
  isPublished: boolean
  isActive: boolean
  showResults: boolean
  expiresAt: string
  createdAt: string
  updatedAt: string
  questions?: Question[]
  responseCount?: number
}

interface OptionStat {
  id: string
  text: string
  count: number
  percent: number
}

export interface QuestionStat {
  id: string
  text: string
  order: number
  isRequired: boolean
  completionRate: number
  options: OptionStat[]
}

export interface Analytics {
  totalResponses: number
  uniqueRespondents: number
  completionRate: number
  healthScore: number
  questionStats: QuestionStat[]
  timeline: { bucket: string; count: number }[]
}
