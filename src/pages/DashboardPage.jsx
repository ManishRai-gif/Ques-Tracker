import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAllClassrooms, getClassroomByCode, getClassroomById, updateClassroom, updateUser, getUserById, getQuestionsByClass, getStudentProgress } from '../utils/db'
import { clamp } from '../utils/helpers'
import { PageHeader } from '../components/shared/PageHeader'
import { Icons } from '../components/shared/Icons'
import { Button, Modal, ProgressBar, EmptyState, StatCard } from '../components/ui/index.jsx'
import { fmtDate } from '../utils/helpers'

export function DashboardPage() {
  const { currentUser, isAdmin, refreshUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [joinOpen, setJoinOpen] = useState(false)
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [tick, setTick] = useState(0)

  const freshUser = getUserById(currentUser?.id) || currentUser
  const classrooms = isAdmin
    ? getAllClassrooms().filter(c => c.adminId === currentUser.id)
    : getAllClassrooms().filter(c => (freshUser.joinedClassrooms || []).includes(c.id))

  const hr = new Date().getHours()
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'

  const handleJoin = () => {
    const c = code.toUpperCase().trim()
    if (!/^[A-Z0-9]{6}$/.test(c)) {
      addToast('Invite code must be exactly 6 alphanumeric characters.', 'error'); return
    }
    setJoining(true)
    setTimeout(() => {
      const cls = getClassroomByCode(c)
      if (!cls) { addToast('No classroom found with this invite code.', 'error'); setJoining(false); return }
      const u = getUserById(currentUser.id)
      if ((u.joinedClassrooms || []).includes(cls.id)) {
        addToast('You are already a member of this classroom.', 'error'); setJoining(false); return
      }
      updateClassroom(cls.id, { studentIds: [...(cls.studentIds || []), currentUser.id] })
      updateUser(currentUser.id, { joinedClassrooms: [...(u.joinedClassrooms || []), cls.id] })
      refreshUser()
      addToast(`Joined "${cls.name}"!`, 'success')
      setJoinOpen(false); setCode(''); setJoining(false); setTick(t => t + 1)
    }, 300)
  }

  return (
    <div className="p-5 sm:p-7 max-w-6xl mx-auto fade-in">
      <PageHeader
        title={`${greet}, ${currentUser?.name?.split(' ')[0]} 👋`}
        sub={isAdmin ? 'Manage your classrooms and track student progress' : 'View your assigned work and progress'}
        actions={
          isAdmin
            ? <Button onClick={() => navigate('/admin/classroom/create')}><Icons.Plus /> New Classroom</Button>
            : <Button onClick={() => setJoinOpen(true)}><Icons.Join /> Join Classroom</Button>
        }
      />

      {isAdmin && (
        <div className="grid grid-cols-3 gap-3 mb-7">
          <StatCard label="Classrooms" val={classrooms.length} icon={<Icons.Book />} color="indigo" />
          <StatCard label="Students"   val={[...new Set(classrooms.flatMap(c => c.studentIds || []))].length} icon={<Icons.Users />} color="green" />
          <StatCard label="Questions"  val={classrooms.reduce((s, c) => s + (c.questionIds || []).length, 0)} icon={<Icons.Link />} color="amber" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Classrooms</h2>
        <span className="text-xs text-gray-400">{classrooms.length} total</span>
      </div>

      {classrooms.length === 0 ? (
        <EmptyState
          icon={<Icons.Book />}
          title={isAdmin ? 'No classrooms yet' : 'Not enrolled anywhere'}
          desc={isAdmin ? 'Create your first classroom to get started.' : 'Ask your teacher for an invite code to join.'}
          action={isAdmin ? 'Create Classroom' : 'Join Classroom'}
          onAction={() => isAdmin ? navigate('/admin/classroom/create') : setJoinOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classrooms.map(c => (
            <ClassCard key={`${c.id}-${tick}`} cls={c} isAdmin={isAdmin} uid={currentUser.id} />
          ))}
        </div>
      )}

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Join a Classroom">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">Enter the 6-character invite code from your teacher.</p>
          <input
            type="text" placeholder="AB1C2D" value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-center text-2xl font-bold tracking-[0.25em] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <Button onClick={handleJoin} loading={joining} disabled={code.length !== 6} className="w-full">
            Join Classroom
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function ClassCard({ cls, isAdmin, uid }) {
  const navigate = useNavigate()
  const qs   = getQuestionsByClass(cls.id)
  const admin = getUserById(cls.adminId)
  const prog  = !isAdmin ? getStudentProgress(uid, cls.id) : []
  const done  = prog.filter(p => p.status === 'Completed').length
  const pct   = qs.length > 0 ? clamp(Math.round((done / qs.length) * 100)) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-gray-900 text-sm truncate font-syne">{cls.name}</h3>
        {cls.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{cls.description}</p>}
      </div>

      <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
        {isAdmin ? (
          <>
            <span className="flex items-center gap-1"><Icons.Users />{(cls.studentIds || []).length}</span>
            <span className="flex items-center gap-1"><Icons.Link />{qs.length} problems</span>
            <span className="ml-auto font-mono text-indigo-500 tracking-widest">{cls.inviteCode}</span>
          </>
        ) : (
          <>
            <span>By {admin?.name || 'Unknown'}</span>
            <span>{qs.length} problems</span>
          </>
        )}
      </div>

      {!isAdmin && qs.length > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{done}/{qs.length} done</span><span>{pct}%</span>
          </div>
          <ProgressBar value={pct} />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/classroom/${cls.id}`)} className="flex-1">
          View
        </Button>
        {isAdmin && (
          <Button size="sm" onClick={() => navigate(`/admin/classroom/${cls.id}/manage`)} className="flex-1">
            Manage
          </Button>
        )}
        {!isAdmin && (
          <Button size="sm" variant="ghost" onClick={() => navigate(`/classroom/${cls.id}/leaderboard`)}>
            <Icons.Trophy />
          </Button>
        )}
      </div>
    </div>
  )
}
