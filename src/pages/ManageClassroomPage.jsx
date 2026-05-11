import { useState, useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useForm } from '../hooks/useForm'
import {
  getClassroomById, getQuestionsByClass, createQuestion,
  updateClassroom, deleteQuestion, getAllUsers, getUserById,
  updateUser, getStudentProgress, deleteStudentClassroomProgress,
} from '../utils/db'
import { uid, now, fmtDate, clamp } from '../utils/helpers'
import { detectPlatform } from '../utils/detectPlatform'
import { Icons } from '../components/shared/Icons'
import { PlatformBadge, DifficultyBadge, Button, EmptyState, ProgressBar, FormLabel, inputCls } from '../components/ui/index.jsx'

const PLATFORMS = ['LeetCode', 'Codeforces', 'GeeksForGeeks', 'HackerRank', 'CodeChef', 'AtCoder', 'SPOJ', 'Custom']
const DIFFS     = ['Easy', 'Medium', 'Hard']

export function ManageClassroomPage() {
  const { classroomId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]   = useState('questions')
  const [tick, setTick] = useState(0)
  const [copied, setCopied] = useState(false)

  const cls = getClassroomById(classroomId)
  if (!cls) return <div className="p-6 text-center text-gray-500">Classroom not found.</div>
  if (cls.adminId !== currentUser.id) return <Navigate to="/unauthorized" replace />

  const copy = () => {
    navigator.clipboard.writeText(cls.inviteCode).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="p-5 sm:p-7 max-w-6xl mx-auto fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
        <Icons.Back /> Dashboard
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 font-syne">{cls.name}</h1>
          {cls.description && <p className="text-sm text-gray-400 mt-0.5">{cls.description}</p>}
          <p className="text-xs text-gray-400 mt-1">Created {fmtDate(cls.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="text-xs text-gray-400">Invite Code</span>
          <span className="font-bold text-indigo-600 tracking-[0.2em] text-sm font-mono">{cls.inviteCode}</span>
          <button onClick={copy} className={`p-1 rounded transition-colors ${copied ? 'text-emerald-600' : 'text-gray-300 hover:text-gray-600'}`}>
            {copied ? <Icons.Check /> : <Icons.Copy />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 rounded-xl p-1 mb-6 w-fit">
        {['questions', 'students'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <QTab key={`q${tick}`} cls={getClassroomById(classroomId)} onRefresh={() => setTick(t => t + 1)} />
      )}
      {tab === 'students' && (
        <STab key={`s${tick}`} cls={getClassroomById(classroomId)} onRefresh={() => setTick(t => t + 1)} />
      )}
    </div>
  )
}

/* ── Questions Tab ──────────────────────────────── */
function QTab({ cls, onRefresh }) {
  const { currentUser } = useAuth()
  const { addToast } = useToast()
  const [search, setSearch]   = useState('')
  const [pf, setPf]           = useState('')
  const [df, setDf]           = useState('')
  const [qtick, setQtick]     = useState(0)

  const all = getQuestionsByClass(cls.id)

  const filtered = useMemo(() =>
    all.filter(q =>
      (!search || q.title.toLowerCase().includes(search.toLowerCase())) &&
      (!pf || q.platform === pf) &&
      (!df || q.difficulty === df)
    ),
    [all, search, pf, df, qtick]
  )

  const { vals, set, err, isValid, touchAll, reset } = useForm(
    { link: '', title: '', platform: '', difficulty: '' },
    {
      link:       { required: true, url: true },
      title:      { required: true, max: 120 },
      platform:   { required: true },
      difficulty: { required: true },
    }
  )

  const urlChange = (url) => {
    set('link', url)
    const p = detectPlatform(url)
    if (p !== 'Custom') set('platform', p)
  }

  const addQ = () => {
    touchAll()
    if (!isValid) return
    if (all.find(q => q.link === vals.link.trim())) {
      addToast('This question has already been added to this classroom.', 'error'); return
    }
    const q = createQuestion({
      id: uid(), classroomId: cls.id, link: vals.link.trim(),
      title: vals.title.trim(), platform: vals.platform,
      difficulty: vals.difficulty, addedAt: now(), addedBy: currentUser.id,
    })
    updateClassroom(cls.id, { questionIds: [...(cls.questionIds || []), q.id] })
    addToast('Question added!', 'success')
    reset(); setQtick(t => t + 1); onRefresh()
  }

  const delQ = (qId) => {
    deleteQuestion(qId)
    updateClassroom(cls.id, { questionIds: (cls.questionIds || []).filter(id => id !== qId) })
    addToast('Question removed.', 'info')
    setQtick(t => t + 1); onRefresh()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Add form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 font-syne">Add Question</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <FormLabel label="Problem URL" err={err('link')} req>
              <input type="url" className={inputCls(err('link'))} placeholder="https://leetcode.com/problems/..."
                value={vals.link} onChange={e => urlChange(e.target.value)} />
            </FormLabel>
          </div>
          <div className="md:col-span-2">
            <FormLabel label="Problem Title" err={err('title')} req>
              <input type="text" className={inputCls(err('title'))} placeholder="e.g. Two Sum" maxLength={120}
                value={vals.title} onChange={e => set('title', e.target.value)} />
            </FormLabel>
          </div>
          <FormLabel label="Platform" err={err('platform')} req>
            <select className={inputCls(err('platform'))} value={vals.platform} onChange={e => set('platform', e.target.value)}>
              <option value="">Select platform...</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormLabel>
          <FormLabel label="Difficulty" err={err('difficulty')} req>
            <select className={inputCls(err('difficulty'))} value={vals.difficulty} onChange={e => set('difficulty', e.target.value)}>
              <option value="">Select difficulty...</option>
              {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormLabel>
        </div>
        <div className="mt-4">
          <Button onClick={addQ}><Icons.Plus /> Add Problem</Button>
        </div>
      </div>

      {/* Question list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-3 border-b border-gray-50 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><Icons.Search /></span>
            <input className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="Search problems..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 focus:outline-none"
            value={pf} onChange={e => setPf(e.target.value)}>
            <option value="">All Platforms</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 focus:outline-none"
            value={df} onChange={e => setDf(e.target.value)}>
            <option value="">All Difficulties</option>
            {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="px-4 py-2 text-xs text-gray-300 border-b border-gray-50">
          Showing {filtered.length} of {all.length} problems
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<Icons.Link />} title="No problems found" desc="Add problems above or adjust your filters." />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(q => (
              <div key={q.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors">
                <div className="flex-1 min-w-0">
                  <a href={q.link} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-800 hover:text-indigo-600 flex items-center gap-1.5 w-fit">
                    {q.title} <span className="opacity-50"><Icons.Ext /></span>
                  </a>
                  <div className="flex gap-1.5 mt-1.5">
                    <PlatformBadge platform={q.platform} />
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>
                </div>
                <span className="text-xs text-gray-300 hidden sm:block">{fmtDate(q.addedAt)}</span>
                <button onClick={() => delQ(q.id)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Delete">
                  <Icons.Trash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Students Tab ───────────────────────────────── */
function STab({ cls, onRefresh }) {
  const { addToast } = useToast()
  const qs       = getQuestionsByClass(cls.id)
  const students = (cls.studentIds || []).map(id => getUserById(id)).filter(Boolean)

  const remove = (sid) => {
    const u = getUserById(sid)
    updateClassroom(cls.id, { studentIds: (cls.studentIds || []).filter(id => id !== sid) })
    if (u) updateUser(sid, { joinedClassrooms: (u.joinedClassrooms || []).filter(id => id !== cls.id) })
    deleteStudentClassroomProgress(sid, cls.id)
    addToast('Student removed.', 'info'); onRefresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {students.length === 0 ? (
        <EmptyState icon={<Icons.Users />} title="No students yet" desc="Share the invite code for students to join." />
      ) : (
        <div className="divide-y divide-gray-50">
          {students.map(st => {
            const prog = getStudentProgress(st.id, cls.id)
            const done = prog.filter(x => x.status === 'Completed').length
            const pct  = qs.length > 0 ? clamp(Math.round((done / qs.length) * 100)) : 0
            return (
              <div key={st.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                  {st.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{st.name}</div>
                  <div className="text-xs text-gray-400">{st.email}</div>
                </div>
                <div className="hidden sm:flex flex-col gap-1 w-28">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{done}/{qs.length}</span><span>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} size="sm" />
                </div>
                <button onClick={() => remove(st.id)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Remove">
                  <Icons.Trash />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
