import { Router } from 'express'
import { pollQueries } from '../../db/queries/polls'
import { renderOgSvg } from './render'

const router = Router()

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function publicUrls() {
  const apiBase =
    process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? '3001'}`
  const clientBase = process.env.CLIENT_URL ?? 'http://localhost:5173'
  return { apiBase, clientBase }
}

/**
 * Dynamic Open Graph image. SVG so we don't need a rasterizer dependency —
 * Twitter/X, Slack, Discord, and modern LinkedIn renderers all support SVG.
 */
router.get('/api/og/:pollId/image.svg', async (req, res, next) => {
  try {
    const poll = await pollQueries.findById(req.params.pollId)
    if (!poll) {
      res.status(404).type('text/plain').send('Poll not found')
      return
    }
    const [{ count }] = await pollQueries.responseCount(poll.id)
    const svg = renderOgSvg({
      title: poll.title,
      description: poll.description,
      responseCount: count,
      isActive: poll.isActive,
      isPublished: poll.isPublished,
      expiresAt: poll.expiresAt,
    })
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300')
    res.send(svg)
  } catch (err) {
    next(err)
  }
})

/**
 * Crawler-friendly share landing page. Returns minimal HTML with full
 * Open Graph + Twitter meta tags pointing at the SVG above, then redirects
 * human visitors to the SPA respond page (or results if already published).
 *
 * Use this URL whenever you copy a "share with preview" link.
 */
router.get(['/share/p/:pollId', '/api/share/p/:pollId'], async (req, res, next) => {
  try {
    const poll = await pollQueries.findById(req.params.pollId)
    if (!poll) {
      res.status(404).type('text/html').send('<h1>Poll not found</h1>')
      return
    }

    const { apiBase, clientBase } = publicUrls()
    const target =
      poll.isPublished && (!poll.isActive || poll.expiresAt < new Date())
        ? `${clientBase}/p/${poll.id}/results`
        : `${clientBase}/p/${poll.id}`
    const ogImage = `${apiBase}/api/og/${poll.id}/image.svg`
    const title = escapeHtml(poll.title)
    const description = escapeHtml(
      poll.description ??
        'Vote in this PulseBoard poll. Live results, no signup required.'
    )

    res
      .status(200)
      .type('text/html')
      .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} · PulseBoard</title>
    <meta name="description" content="${description}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="PulseBoard" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${escapeHtml(target)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />

    <link rel="canonical" href="${escapeHtml(target)}" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}" />
    <style>
      body {
        font-family: Inter, system-ui, -apple-system, sans-serif;
        background: #0c0c0e;
        color: #eeecea;
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 24px;
        text-align: center;
      }
      a {
        color: #818cf8;
      }
      .card {
        max-width: 480px;
      }
      .preview {
        max-width: 100%;
        height: auto;
        border-radius: 16px;
        margin-bottom: 24px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
      }
    </style>
  </head>
  <body>
    <div class="card">
      <img class="preview" src="${ogImage}" alt="${title}" />
      <h1 style="margin: 0 0 8px 0; font-size: 22px;">${title}</h1>
      <p style="color: #8c8a86; margin: 0 0 16px 0;">${description}</p>
      <p>
        Redirecting to <a href="${escapeHtml(target)}">the poll</a>…
      </p>
    </div>
    <script>
      window.location.replace(${JSON.stringify(target)});
    </script>
  </body>
</html>`)
  } catch (err) {
    next(err)
  }
})

export default router
