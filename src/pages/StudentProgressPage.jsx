import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getClassroomById, getQuestionsByClass, getStudentProgress } from '../utils/db'
import { clamp, fmtDateTime } from '../utils/helpers'
import { PageHeader } from '../components/shared/PageHeader'
import { Icons } from '../components/shared/Icons'
import { PlatformBadge, DifficultyBadge, Badge, StatCard, EmptyState } from '../components/ui/index.jsx'

const FILTERS = ['All', 'Completed', 'In Progress', 'Not Started']

export function StudentProgressPage() {
  const { classroomId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')

  const cls  = getClassroomById(classroomId)
  const qs   = getQuestionsByClass(classroomId)
  const prog = getStudentProgress(currentUser.id, classroomId)
  if (!cls) return <div className="p-6 text-center text-gray-500">Classroom not found.</div>

  const getStatus = (qid) => prog.find(p => p.questionId === qid)?.status || 'Not Started'
  const getTs     = (qid) => prog.find(p => p.questionId === qid)?.markedAt || null

  const stats = useMemo(() => {
    const done = prog.filter(p => p.status === 'Completed').length
    const ip   = prog.filter(p => p.status === 'In Progress').length
    const ns   = Math.max(0, qs.length - done - ip)
    return { total: qs.length, done, ip, ns, pct: qs.length > 0 ? clamp(Math.round((done / qs.length) * 100)) : 0 }
  }, [qs, prog])

  const shown = useMemo(() =>
    filter === 'All' ? qs : qs.filter(q => getStatus(q.id) === filter),
    [qs, filter, prog]
  )

  const statusColor = { 'Not Started': 'gray', 'In Progress': 'yellow', 'Completed': 'green' }

  /* SVG Donut */
  const total  = stats.total || 1
  const r      = 52, cx = 70, cy = 70, sw = 14
  const circ   = 2 * Math.PI * r
  const segs   = [
    { v: stats.done, color: '#10b981' },
    { v: stats.ip,   color: '#f59e0b' },
    { v: stats.ns,   color: '#e5e7eb' },
  ]
  let offset = 0
  const donutArcs = segs.map((seg, i) => {
    const pct     = seg.v / total
    const dash    = pct * circ
    const gap     = circ - dash
    const dashOff = -(offset * circ) + circ * 0.25
    const arc     = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
      strokeWidth={sw} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={dashOff} />
    offset += pct
    return arc
  })

  return (
    <div className="p-5 sm:p-7 max-w-5xl mx-auto fade-in">
      <button onClick={() => navigate(`/classroom/${classroomId}`)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
        <Icons.Back /> Back to Classroom
      </button>
      <PageHeader title="My Progress" sub={cls.name} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total"       val={stats.total} icon={<Icons.Link />}         color="indigo" />
        <StatCard label="Completed"   val={stats.done}  icon={<Icons.Check />}        color="green"  />
        <StatCard label="In Progress" val={stats.ip}    icon={<Icons.Chart />}        color="amber"  />
        <StatCard label="Not Started" val={stats.ns}    icon={<Icons.X />}            color="red"    />
      </div>

      {/* Donut chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5 flex items-center justify-center">
        <div className="flex items-center gap-8">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {donutArcs}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1f2937" fontFamily="Syne,sans-serif">
              {stats.pct}%
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#9ca3af">complete</text>
          </svg>
          <div className="flex flex-col gap-2 text-xs">
            {[['Completed', '#10b981', stats.done], ['In Progress', '#f59e0b', stats.ip], ['Not Started', '#e5e7eb', stats.ns]].map(([l, c, v]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c }} />
                <span className="text-gray-500">{l}</span>
                <span className="font-bold text-gray-700 ml-auto pl-4">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100/80 rounded-xl p-1 mb-4 w-fit flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Problem list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {shown.length === 0 ? (
          <EmptyState icon={<Icons.Book />} title="Nothing here" desc="No problems match this filter." />
        ) : (
          <div className="divide-y divide-gray-50">
            {shown.map(q => (
              <div key={q.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
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
                <div className="hidden sm:block text-xs text-gray-300 text-right min-w-[100px]">
                  {getTs(q.id) ? fmtDateTime(getTs(q.id)) : '—'}
                </div>
                <Badge color={statusColor[getStatus(q.id)]} dot>{getStatus(q.id)}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
