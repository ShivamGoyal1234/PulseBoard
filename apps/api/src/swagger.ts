import type { Express } from 'express'
import swaggerUi from 'swagger-ui-express'
import openApiSpec from './openapi/openapi.json'

export function setupSwagger(app: Express): void {
  const port = process.env.PORT ?? '3001'
  const baseUrl = process.env.API_PUBLIC_URL ?? `http://localhost:${port}`
  const spec = {
    ...openApiSpec,
    servers: [{ url: baseUrl, description: 'Configured server (API_PUBLIC_URL or localhost + PORT)' }],
  }

  app.get('/api/openapi.json', (_req, res) => {
    res.json(spec)
  })

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'PulseBoard API' }))
}
