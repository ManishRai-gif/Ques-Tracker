import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useForm } from '../hooks/useForm'
import { createClassroom } from '../utils/db'
import { uid, now, inviteCode } from '../utils/helpers'
import { PageHeader } from '../components/shared/PageHeader'
import { Icons } from '../components/shared/Icons'
import { Button, FormLabel, inputCls } from '../components/ui/index.jsx'

export function CreateClassroomPage() {
  const { currentUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)
  const [copied, setCopied] = useState(false)

  const { vals, set, err, isValid, touchAll } = useForm(
    { name: '', desc: '' },
    { name: { required: true, max: 60 } }
  )

  const submit = () => {
    touchAll()
    if (!isValid) return
    setLoading(true)
    setTimeout(() => {
      const ic  = inviteCode()
      const cls = createClassroom({
        id: uid(), name: vals.name.trim(), description: vals.desc.trim(),
        adminId: currentUser.id, inviteCode: ic, createdAt: now(),
        studentIds: [], questionIds: [],
      })
      addToast('Classroom created!', 'success')
      setDone(cls)
      setLoading(false)
    }, 300)
  }

  const copy = () => {
    navigator.clipboard.writeText(done.inviteCode).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  if (done) return (
    <div className="p-5 sm:p-7 max-w-md mx-auto fade-in">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-4">
          <Icons.Check size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1 font-syne">Classroom Created!</h2>
        <p className="text-gray-400 text-sm mb-6">Share the invite code with your students.</p>

        <div className="bg-[#0f0e1a] rounded-2xl p-6 mb-6">
          <div className="text-gray-500 text-xs uppercase tracking-widest mb-2">Invite Code</div>
          <div className="text-white text-4xl font-bold tracking-[0.25em] mb-4 font-mono">{done.inviteCode}</div>
          <button
            onClick={copy}
            className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              copied ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
            }`}
          >
            {copied ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy Code</>}
          </button>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/dashboard')} className="flex-1">Dashboard</Button>
          <Button onClick={() => navigate(`/admin/classroom/${done.id}/manage`)} className="flex-1">Manage</Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-5 sm:p-7 max-w-xl mx-auto fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
        <Icons.Back /> Back
      </button>
      <PageHeader title="Create Classroom" sub="Set up a new virtual classroom for your students" />

      <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
        <div className="flex flex-col gap-5">
          <FormLabel label="Classroom Name" err={err('name')} req>
            <input
              type="text" className={inputCls(err('name'))} maxLength={60}
              placeholder="e.g. DSA Batch A — June 2025"
              value={vals.name} onChange={e => set('name', e.target.value)}
            />
            <span className="text-xs text-gray-300 text-right">{vals.name.length}/60</span>
          </FormLabel>

          <FormLabel label="Description (optional)">
            <textarea
              className={inputCls(false)} rows={3} style={{ resize: 'none' }}
              placeholder="Brief description of the classroom..."
              value={vals.desc} onChange={e => set('desc', e.target.value)}
            />
          </FormLabel>

          <Button onClick={submit} loading={loading} size="lg" className="w-full">
            <Icons.Plus /> Create Classroom
          </Button>
        </div>
      </div>
    </div>
  )
}
