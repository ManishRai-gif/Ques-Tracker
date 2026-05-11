import { createPortal } from 'react-dom'
import { clamp } from '../../utils/helpers'

/* ── Spinner ──────────────────────────────────── */
export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-5 h-5 border-2', lg: 'w-8 h-8 border-[3px]' }
  return (
    <div
      className={`spin rounded-full border-current border-t-transparent ${s[size]}`}
      role="status" aria-label="Loading"
    />
  )
}

/* ── Button ───────────────────────────────────── */
export function Button({
  children, variant = 'primary', size = 'md',
  onClick, disabled, loading, type = 'button', className = '',
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all select-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white focus:ring-indigo-400 shadow-sm',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 focus:ring-gray-300 shadow-sm',
    danger:    'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400',
    ghost:     'bg-transparent hover:bg-gray-100 text-gray-600 focus:ring-gray-300',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400 shadow-sm',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-2.5 text-sm' }
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}

/* ── Badge ────────────────────────────────────── */
export function Badge({ children, color = 'gray', dot }) {
  const colors = {
    gray:   'bg-gray-100 text-gray-600',
    green:  'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    red:    'bg-red-100 text-red-700',
    blue:   'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    orange: 'bg-orange-100 text-orange-700',
    teal:   'bg-teal-100 text-teal-700',
    purple: 'bg-purple-100 text-purple-700',
    brown:  'bg-yellow-800 text-yellow-100',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

/* ── PlatformBadge ────────────────────────────── */
export function PlatformBadge({ platform }) {
  const map = {
    LeetCode:     'orange',
    Codeforces:   'blue',
    GeeksForGeeks:'green',
    HackerRank:   'teal',
    CodeChef:     'brown',
    AtCoder:      'purple',
    SPOJ:         'gray',
    Custom:       'gray',
  }
  const label = platform === 'GeeksForGeeks' ? 'GFG' : platform
  return <Badge color={map[platform] || 'gray'}>{label}</Badge>
}

/* ── DifficultyBadge ──────────────────────────── */
export function DifficultyBadge({ difficulty }) {
  const map = { Easy: 'green', Medium: 'yellow', Hard: 'red' }
  return <Badge color={map[difficulty] || 'gray'}>{difficulty}</Badge>
}

/* ── ProgressBar ──────────────────────────────── */
export function ProgressBar({ value, color = 'indigo', label, size = 'md' }) {
  const v = clamp(value)
  const colors = { indigo: 'bg-indigo-600', green: 'bg-emerald-500', amber: 'bg-amber-500', blue: 'bg-blue-500' }
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${colors[color] || colors.indigo} ${heights[size]} rounded-full transition-all duration-500`}
          style={{ width: `${v}%` }}
          role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}
        />
      </div>
      {label && <span className="text-xs text-gray-400 font-mono w-9 text-right">{v.toFixed(0)}%</span>}
    </div>
  )
}

/* ── EmptyState ───────────────────────────────── */
export function EmptyState({ icon, title, desc, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center fade-in">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 mb-4">
        {icon}
      </div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-400 max-w-xs mb-4">{desc}</p>
      {action && onAction && (
        <Button size="sm" onClick={onAction}>{action}</Button>
      )}
    </div>
  )
}

/* ── StatCard ─────────────────────────────────── */
export function StatCard({ label, val, icon, color = 'indigo' }) {
  const bg = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green:  'bg-emerald-50 text-emerald-600',
    amber:  'bg-amber-50 text-amber-600',
    blue:   'bg-blue-50 text-blue-600',
    red:    'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg[color] || bg.indigo}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900 font-syne">{val}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  )
}

/* ── FormLabel ────────────────────────────────── */
export function FormLabel({ label, err, children, req }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {req && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {err && <p className="text-red-500 text-xs" role="alert">{err}</p>}
    </div>
  )
}

export const inputCls = (hasErr) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 ${
    hasErr
      ? 'border-red-300 bg-red-50'
      : 'border-gray-200 bg-white hover:border-gray-300'
  }`

/* ── Modal ────────────────────────────────────── */
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 font-syne">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}
