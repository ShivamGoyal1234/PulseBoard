interface RenderInput {
  title: string
  description?: string | null
  responseCount: number
  isActive: boolean
  isPublished: boolean
  expiresAt?: Date | null
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapTitle(text: string, maxLineLen = 32, maxLines = 2): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return ['Untitled poll']
  const words = clean.split(' ')
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w
    if (candidate.length > maxLineLen) {
      if (current) {
        lines.push(current)
        current = w
      } else {
        lines.push(w.slice(0, maxLineLen - 1) + '…')
        current = ''
      }
      if (lines.length === maxLines) {
        return lines
      }
    } else {
      current = candidate
    }
  }
  if (current && lines.length < maxLines) lines.push(current)
  if (lines.length === 0) lines.push('Untitled poll')
  // If we truncated, add an ellipsis to the last line.
  const remaining = clean.split(' ').slice(lines.join(' ').split(' ').length).join(' ')
  if (remaining.length > 0) {
    const last = lines[lines.length - 1]
    const room = maxLineLen - 1 - last.length
    if (room > 0) {
      lines[lines.length - 1] = `${last}…`
    } else {
      lines[lines.length - 1] = `${last.slice(0, maxLineLen - 1)}…`
    }
  }
  return lines
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return `${s.slice(0, n - 1)}…`
}

export function renderOgSvg(input: RenderInput): string {
  const titleLines = wrapTitle(input.title, 28, 2)
  const description = input.description
    ? truncate(input.description.replace(/\s+/g, ' ').trim(), 96)
    : ''
  const counter = input.responseCount.toLocaleString()
  const expired =
    !input.isActive ||
    (input.expiresAt ? input.expiresAt.getTime() < Date.now() : false)
  const statusLabel = input.isPublished
    ? 'Published results'
    : expired
      ? 'Closed'
      : 'Collecting responses'
  const statusFg = input.isPublished ? '#93C5FD' : expired ? '#FCD34D' : '#86EFAC'
  const statusBg = input.isPublished
    ? 'rgba(30,64,175,0.25)'
    : expired
      ? 'rgba(146,64,14,0.30)'
      : 'rgba(22,101,52,0.30)'
  const statusBorder = input.isPublished
    ? 'rgba(147,197,253,0.55)'
    : expired
      ? 'rgba(252,211,77,0.5)'
      : 'rgba(134,239,172,0.55)'

  const title1 = escapeXml(titleLines[0] ?? '')
  const title2 = escapeXml(titleLines[1] ?? '')
  const descriptionEsc = escapeXml(description)

  const bars = Array.from({ length: 12 }).map((_, i) => {
    const seed = (input.responseCount * (i + 3) + (i * i * 7)) % 100
    const h = 40 + (seed % 110)
    return { x: 64 + i * 22, h }
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${escapeXml(input.title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F1023"/>
      <stop offset="50%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#0C2A3A"/>
    </linearGradient>
    <radialGradient id="orb1" cx="0.85" cy="0.15" r="0.5">
      <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#4F46E5" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb2" cx="0.1" cy="0.95" r="0.55">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#06B6D4" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#orb1)"/>
  <rect width="1200" height="630" fill="url(#orb2)"/>

  <!-- Logo -->
  <g transform="translate(64,64)">
    <rect x="0" y="0" rx="14" ry="14" width="56" height="56" fill="url(#ring)"/>
    <text x="28" y="38" text-anchor="middle" font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="30" font-weight="800" fill="#0C0C0E">P</text>
    <text x="72" y="26" font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="#EEECEA">PulseBoard</text>
    <text x="72" y="50" font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="14" fill="#8C8A86">Real-time polls · live analytics</text>
  </g>

  <!-- Status pill -->
  <g transform="translate(64,148)">
    <rect x="0" y="0" rx="18" ry="18" width="260" height="36" fill="${statusBg}" stroke="${statusBorder}"/>
    <circle cx="20" cy="18" r="5" fill="${statusFg}"/>
    <text x="36" y="24" font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="${statusFg}">${escapeXml(statusLabel)}</text>
  </g>

  <!-- Title -->
  <g transform="translate(64,220)">
    <text font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="#FFFFFF">
      <tspan x="0" dy="0">${title1}</tspan>
      ${title2 ? `<tspan x="0" dy="76">${title2}</tspan>` : ''}
    </text>
  </g>

  <!-- Description -->
  ${
    description
      ? `<g transform="translate(64,${title2 ? 400 : 320})">
    <text font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="22" fill="rgba(238,236,234,0.75)">${descriptionEsc}</text>
  </g>`
      : ''
  }

  <!-- Mini bar chart -->
  <g transform="translate(0,${title2 ? 440 : 360})">
    <rect x="50" y="0" rx="20" ry="20" width="320" height="150" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)"/>
    ${bars
      .map(
        (b) =>
          `<rect x="${b.x}" y="${130 - b.h}" rx="3" ry="3" width="12" height="${b.h}" fill="url(#bar)" opacity="0.85"/>`
      )
      .join('\n    ')}
    <text x="70" y="28" font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="13" font-weight="600" fill="rgba(238,236,234,0.8)">Response velocity</text>
  </g>

  <!-- Response count -->
  <g transform="translate(820,${title2 ? 230 : 200})">
    <text font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="18" fill="rgba(238,236,234,0.65)">RESPONSES</text>
    <text font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="120" font-weight="800" fill="#FFFFFF" y="118">${escapeXml(counter)}</text>
    <text font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="14" fill="rgba(238,236,234,0.6)" y="148">live · fingerprint-verified</text>
  </g>

  <!-- Footer -->
  <g transform="translate(64,560)">
    <text font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="14" fill="rgba(238,236,234,0.55)">pulseboard.shivam-goyal.site · vote in seconds</text>
  </g>
  <g transform="translate(1136,560)">
    <text text-anchor="end" font-family="Inter, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="rgba(238,236,234,0.7)">Tap to vote →</text>
  </g>
</svg>`
}
