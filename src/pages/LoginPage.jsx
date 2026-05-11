import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useForm } from '../hooks/useForm'
import { getUserByEmail } from '../utils/db'
import { Button, Spinner } from '../components/ui/index.jsx'

export function LoginPage() {
  const { currentUser, login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { vals, set, err, isValid, touchAll } = useForm(
    { email: '', password: '' },
    { email: { required: true, email: true }, password: { required: true } }
  )

  if (currentUser) return <Navigate to="/dashboard" replace />

  const submit = () => {
    touchAll()
    if (!isValid) return
    setLoading(true)
    setTimeout(() => {
      const u = getUserByEmail(vals.email)
      if (!u || u.password !== vals.password) {
        addToast('Invalid email or password.', 'error')
        setLoading(false)
        return
      }
      login(u)
      navigate('/dashboard')
      setLoading(false)
    }, 250)
  }

  const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.05] text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0e1a] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl mx-auto mb-4 font-syne">D</div>
          <h1 className="text-2xl font-bold text-white font-syne">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-[#1a1929] border border-white/[0.08] rounded-2xl p-7 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm font-medium">Email</label>
              <input
                type="email" className={inp} placeholder="you@example.com"
                value={vals.email} onChange={e => set('email', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              {err('email') && <p className="text-red-400 text-xs">{err('email')}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm font-medium">Password</label>
              <input
                type="password" className={inp} placeholder="••••••••"
                value={vals.password} onChange={e => set('password', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              {err('password') && <p className="text-red-400 text-xs">{err('password')}</p>}
            </div>

            <Button onClick={submit} loading={loading} size="lg" className="w-full mt-1">
              Sign In
            </Button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-5">
            No account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
