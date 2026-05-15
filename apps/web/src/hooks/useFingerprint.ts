async function getFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 'canvas-unavailable'
  ctx.fillText('pulseBoard🔒', 10, 10)
  const canvasHash = canvas.toDataURL()
  const raw = [
    canvasHash,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency,
    `${screen.width}x${screen.height}`,
    navigator.platform,
  ].join('|')
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(raw)
  )
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function useFingerprint() {
  return { getFingerprint }
}
