import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useForm } from '../hooks/useForm'
import { getUserByEmail, createUser } from '../utils/db'
import { uid, now } from '../utils/helpers'
import { Button } from '../components/ui/index.jsx'

export function RegisterPage() {
  const { currentUser, login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { vals, set, err, isValid, touchAll } = useForm(
    { name: '', email: '', password: '', role: '' },
    {
      name:     { required: true },
      email:    { required: true, email: true },
      password: { required: true, min: 6 },
      role:     { required: true },
    }
  )

  if (currentUser) return <Navigate to="/dashboard" replace />

  const submit = () => {
    touchAll()
    if (!isValid) return
    setLoading(true)
    setTimeout(() => {
      if (getUserByEmail(vals.email)) {
        addToast('An account with this email already exists.', 'error')
        setLoading(false)
        return
      }
      const u = createUser({
        id: uid(), name: vals.name.trim(),
        email: vals.email.trim().toLowerCase(),
        password: vals.password, role: vals.role,
        createdAt: now(), joinedClassrooms: [],
      })
      login(u)
      navigate('/dashboard')
      addToast('Account created!', 'success')
      setLoading(false)
    }, 250)
  }

  const inp = (hasErr) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-white placeholder-gray-600 ${
      hasErr
        ? 'border-red-500/50 bg-red-900/10'
        : 'border-white/[0.08] bg-white/[0.05]'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0e1a] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl mx-auto mb-4 font-syne">D</div>
          <h1 className="text-2xl font-bold text-white font-syne">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join DSA Classroom Tracker</p>
        </div>

        <div className="bg-[#1a1929] border border-white/[0.08] rounded-2xl p-7 shadow-2xl">
          <div className="flex flex-col gap-4">
            {[
              { label: 'Full Name',  field: 'name',     type: 'text',     ph: 'Jane Doe'           },
              { label: 'Email',      field: 'email',    type: 'email',    ph: 'you@example.com'    },
              { label: 'Password',   field: 'password', type: 'password', ph: 'Min. 6 characters'  },
            ].map(({ label, field, type, ph }) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-gray-300 text-sm font-medium">{label} <span className="text-red-400">*</span></label>
                <input
                  type={type} className={inp(err(field))} placeholder={ph}
                  value={vals[field]} onChange={e => set(field, e.target.value)}
                />
                {err(field) && <p className="text-red-400 text-xs">{err(field)}</p>}
              </div>
            ))}

            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm font-medium">Role <span className="text-red-400">*</span></label>
              <select
                className={`${inp(err('role'))} [&>option]:bg-[#1a1929] [&>option]:text-white`}
                value={vals.role} onChange={e => set('role', e.target.value)}
              >
                <option value="">Select role...</option>
                <option value="admin">Teacher / Admin</option>
                <option value="student">Student</option>
              </select>
              {err('role') && <p className="text-red-400 text-xs">{err('role')}</p>}
            </div>

            <Button onClick={submit} loading={loading} size="lg" className="w-full mt-1">
              Create Account
            </Button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-5">
            Have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
