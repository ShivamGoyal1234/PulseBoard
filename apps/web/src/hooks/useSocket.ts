import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

export interface AnalyticsUpdate {
  totalResponses: number
  questionStats: Record<string, Record<string, number>>
}

export function useSocket(pollId: string) {
  const token = useAuthStore((s) => s.token)
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsUpdate | null>(null)
  const [lastResponse, setLastResponse] = useState<{
    count: number
    respondedAt: string
  } | null>(null)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join:poll', pollId)
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('analytics:update', (data: AnalyticsUpdate) =>
      setAnalytics(data)
    )
    socket.on(
      'response:new',
      (data: { count: number; respondedAt: string }) =>
        setLastResponse(data)
    )

    return () => {
      socket.emit('leave:poll', pollId)
      socket.disconnect()
    }
  }, [pollId, token])

  return { connected, analytics, lastResponse }
}
