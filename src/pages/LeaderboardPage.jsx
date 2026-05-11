import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getClassroomById, getQuestionsByClass, getUserById, getStudentProgress } from '../utils/db'
import { clamp, fmtDate } from '../utils/helpers'
import { PageHeader } from '../components/shared/PageHeader'
import { Icons } from '../components/shared/Icons'
import { Button, Badge, ProgressBar, EmptyState } from '../components/ui/index.jsx'

export function LeaderboardPage() {
  const { classroomId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [tick, setTick]     = useState(0)

  const cls = getClassroomById(classroomId)
  const qs  = getQuestionsByClass(classroomId)
  if (!cls) return <div className="p-6 text-center text-gray-500">Classroom not found.</div>

  const board = useMemo(() => {
    const students = (cls.studentIds || []).map(id => getUserById(id)).filter(Boolean)
    return students
      .map(st => {
        const prog = getStudentProgress(st.id, classroomId)
        const done = prog.filter(x => x.status === 'Completed').length
        const last = prog.reduce((l, x) => (!l || x.markedAt > l ? x.markedAt : l), null)
        return {
          ...st,
          done,
          pct:  qs.length > 0 ? clamp(Math.round((done / qs.length) * 100)) : 0,
          last,
        }
      })
      .sort((a, b) => b.done - a.done || b.pct - a.pct)
  }, [classroomId, tick])

  const shown = useMemo(() =>
    board.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase())),
    [board, search]
  )

  const medals   = ['🥇', '🥈', '🥉']
  const medalBg  = [
    'bg-amber-50 border-amber-200',
    'bg-gray-50 border-gray-200',
    'bg-orange-50 border-orange-200',
  ]

  return (
    <div className="p-5 sm:p-7 max-w-3xl mx-auto fade-in">
      <button onClick={() => navigate(`/classroom/${classroomId}`)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
        <Icons.Back /> Back
      </button>

      <PageHeader
        title="Leaderboard"
        sub={cls.name}
        actions={
          <Button size="sm" variant="secondary" onClick={() => setTick(t => t + 1)}>
            <Icons.Refresh /> Refresh
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-3 border-b border-gray-50">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><Icons.Search /></span>
            <input
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState icon={<Icons.Trophy />} title="No students yet" desc="Students need to join this classroom first." />
        ) : (
          <div className="divide-y divide-gray-50">
            {shown.map(st => {
              const rank = board.findIndex(s => s.id === st.id) + 1
              const isMe = st.id === currentUser.id
              return (
                <div key={st.id} className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${isMe ? 'bg-indigo-50/60' : 'hover:bg-gray-50/50'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 border ${rank <= 3 ? medalBg[rank - 1] : 'bg-gray-50 border-gray-200 text-gray-400 text-xs'}`}>
                    {rank <= 3 ? medals[rank - 1] : rank}
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                    {st.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {st.name}
                      {isMe && <Badge color="indigo">You</Badge>}
                    </div>
                    <div className="text-xs text-gray-300">
                      {st.last ? `Last active ${fmtDate(st.last)}` : 'No activity yet'}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col gap-1 w-28">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{st.done}/{qs.length}</span><span>{st.pct}%</span>
                    </div>
                    <ProgressBar value={st.pct} size="sm" />
                  </div>
                  <div className="text-sm font-bold text-indigo-600 w-10 text-right">{st.done}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
