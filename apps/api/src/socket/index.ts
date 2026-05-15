import { Server } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import jwt from 'jsonwebtoken'

let io: Server

export function initSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL!, credentials: true },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined
    if (token) {
      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET!
        ) as { sub: string }
        socket.data.userId = payload.sub
      } catch {
        /* anonymous is fine */
      }
    }
    next()
  })

  io.on('connection', (socket) => {
    socket.on('join:poll', (pollId: string) => {
      void socket.join(`poll:${pollId}`)
    })
    socket.on('leave:poll', (pollId: string) => {
      void socket.leave(`poll:${pollId}`)
    })
  })

  return io
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized')
  return io
}
