import { createContext, useContext, useState, useCallback } from 'react'
import { uid } from '../utils/helpers'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [list, setList] = useState([])

  const addToast = useCallback((msg, type = 'info') => {
    const id = uid()
    setList(p => [...p, { id, msg, type }])
    setTimeout(() => setList(p => p.filter(t => t.id !== id)), 3600)
  }, [])

  const remove = (id) => setList(p => p.filter(t => t.id !== id))

  return (
    <ToastCtx.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {list.map(t => <ToastItem key={t.id} t={t} onClose={() => remove(t.id)} />)}
      </div>
    </ToastCtx.Provider>
  )
}

function ToastItem({ t, onClose }) {
  const styles = {
    success: 'bg-emerald-600',
    error:   'bg-red-600',
    info:    'bg-indigo-600',
  }
  return (
    <div className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl ${styles[t.type] || styles.info} text-white`} role="alert">
      <span className="flex-1 text-sm font-medium leading-snug">{t.msg}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

export const useToast = () => useContext(ToastCtx)
