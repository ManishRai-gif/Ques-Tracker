export const uid   = () => crypto.randomUUID()
export const now   = () => new Date().toISOString()
export const clamp = (v) => Math.min(100, Math.max(0, v))

export const inviteCode = () =>
  Math.random().toString(36).toUpperCase().substring(2, 8)

export const isValidUrl = (s) => {
  try { new URL(s); return true } catch { return false }
}

export const fmtDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(iso))
  } catch { return '—' }
}

export const fmtDateTime = (iso) => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch { return '—' }
}
