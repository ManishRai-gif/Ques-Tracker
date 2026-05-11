import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getClassroomById, getQuestionsByClass, getUserById,
  getStudentProgress, getClassroomProgress, upsertProgress,
} from '../utils/db'
import { clamp } from '../utils/helpers'
import { Icons } from '../components/shared/Icons'
import { PlatformBadge, DifficultyBadge, Button, ProgressBar, EmptyState } from '../components/ui/index.jsx'

export function ClassroomDetailPage() {
  const { classroomId } = useParams()
  const { currentUser, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [tick, setTick]     = useState(0)
  const [copied, setCopied] = useState(false)

  const cls = getClassroomById(classroomId)
  if (!cls) return <div className="p-6 text-center text-gray-500">Classroom not found.</div>

  const hasAccess = isAdmin
    ? cls.adminId === currentUser.id
    : (cls.studentIds || []).includes(currentUser.id)
  if (!hasAccess) return <Navigate to="/unauthorized" replace />

  const qs      = getQuestionsByClass(classroomId)
  const adminU  = getUserById(cls.adminId)
  const myProg  = isAdmin ? [] : getStudentProgress(currentUser.id, classroomId)
  const myDone  = myProg.filter(p => p.status === 'Completed').length
  const myPct   = qs.length > 0 ? clamp(Math.round((myDone / qs.length) * 100)) : 0

  const allProg    = getClassroomProgress(classroomId)
  const totalPairs = (cls.studentIds || []).length * qs.length
  const classDone  = allProg.filter(p => p.status === 'Completed').length
  const classPct   = totalPairs > 0 ? clamp(Math.round((classDone / totalPairs) * 100)) : 0

  const copy = () => {
    navigator.clipboard.writeText(cls.inviteCode).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const getStatus = (qid) => {
    const p = getStudentProgress(currentUser.id, classroomId).find(p => p.questionId === qid)
    return p ? p.status : 'Not Started'
  }

  const setStatus = (qid, status) => {
    upsertProgress(currentUser.id, qid, classroomId, status)
    setTick(t => t + 1)
  }

  const statusStyle = {
    'Not Started': 'border-gray-200 text-gray-500 bg-white',
    'In Progress':  'border-amber-300 text-amber-600 bg-amber-50',
    'Completed':    'border-emerald-300 text-emerald-600 bg-emerald-50',
  }

  return (
    <div className="p-5 sm:p-7 max-w-4xl mx-auto fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
        <Icons.Back /> Dashboard
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 font-syne">{cls.name}</h1>
            {cls.description && <p className="text-sm text-gray-400 mt-0.5">{cls.description}</p>}
            <p className="text-xs text-gray-300 mt-1">
              {isAdmin
                ? <>Invite: <span className="font-mono text-indigo-500 tracking-widest ml-1">{cls.inviteCode}</span></>
                : `Teacher: ${adminU?.name || 'Unknown'} · ${qs.length} problems`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <button
                onClick={copy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  copied ? 'border-emerald-300 text-emerald-600 bg-emerald-50' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                }`}
              >
                {copied ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy Code</>}
              </button>
            )}
            {isAdmin && (
              <Button size="sm" onClick={() => navigate(`/admin/classroom/${classroomId}/manage`)}>
                <Icons.Settings /> Manage
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => navigate(`/classroom/${classroomId}/leaderboard`)}>
              <Icons.Trophy /> Leaderboard
            </Button>
            {!isAdmin && (
              <Button size="sm" variant="ghost" onClick={() => navigate(`/student/progress/${classroomId}`)}>
                <Icons.Chart /> Progress
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span className="font-medium">{isAdmin ? 'Class Progress' : 'My Progress'}</span>
            <span>
              {isAdmin ? `${classDone}/${totalPairs}` : `${myDone}/${qs.length}`} completed
            </span>
          </div>
          <ProgressBar value={isAdmin ? classPct : myPct} label />
        </div>
      </div>

      {/* Question list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 font-syne">Problems ({qs.length})</h2>
        </div>
        {qs.length === 0 ? (
          <EmptyState
            icon={<Icons.Link />}
            title="No problems yet"
            desc={isAdmin ? 'Add problems from the Manage page.' : "Your teacher hasn't added any problems yet."}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {qs.map(q => {
              const st = !isAdmin ? getStatus(q.id) : null
              return (
                <div key={`${q.id}-${tick}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <a href={q.link} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-800 hover:text-indigo-600 flex items-center gap-1.5 w-fit">
                      {q.title} <span className="opacity-40"><Icons.Ext /></span>
                    </a>
                    <div className="flex gap-1.5 mt-1.5">
                      <PlatformBadge platform={q.platform} />
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>
                  </div>
                  {!isAdmin && (
                    <select
                      value={st}
                      onChange={e => setStatus(q.id, e.target.value)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none transition-all ${statusStyle[st] || statusStyle['Not Started']}`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">✓ Completed</option>
                    </select>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
