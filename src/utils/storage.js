export const getItem = (key) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : null
  } catch { return null }
}

export const setItem = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export const removeItem = (key) => {
  try { localStorage.removeItem(key) } catch {}
}
