import { getItem, setItem } from './storage'

// ── Users ──────────────────────────────────────────
export const getAllUsers    = ()     => getItem('dsa_users') || []
export const getUserById   = (id)   => getAllUsers().find(u => u.id === id) || null
export const getUserByEmail= (em)   => getAllUsers().find(u => u.email.toLowerCase() === em.toLowerCase()) || null
export const createUser    = (data) => { const arr = getAllUsers(); arr.push(data); setItem('dsa_users', arr); return data }
export const updateUser    = (id, upd) => {
  const arr = getAllUsers().map(u => u.id === id ? { ...u, ...upd } : u)
  setItem('dsa_users', arr)
  return arr.find(u => u.id === id)
}

// ── Classrooms ─────────────────────────────────────
export const getAllClassrooms    = ()      => getItem('dsa_classrooms') || []
export const getClassroomById   = (id)    => getAllClassrooms().find(c => c.id === id) || null
export const getClassroomByCode = (code)  => getAllClassrooms().find(c => c.inviteCode === code.toUpperCase()) || null
export const createClassroom    = (data)  => { const arr = getAllClassrooms(); arr.push(data); setItem('dsa_classrooms', arr); return data }
export const updateClassroom    = (id, upd) => {
  const arr = getAllClassrooms().map(c => c.id === id ? { ...c, ...upd } : c)
  setItem('dsa_classrooms', arr)
  return arr.find(c => c.id === id)
}

// ── Questions ──────────────────────────────────────
export const getAllQuestions        = ()    => getItem('dsa_questions') || []
export const getQuestionsByClass    = (cid) => getAllQuestions().filter(q => q.classroomId === cid)
export const createQuestion         = (data)=> { const arr = getAllQuestions(); arr.push(data); setItem('dsa_questions', arr); return data }
export const deleteQuestion         = (id)  => {
  setItem('dsa_questions', getAllQuestions().filter(q => q.id !== id))
  setItem('dsa_progress',  getAllProgress().filter(p => p.questionId !== id))
}

// ── Progress ───────────────────────────────────────
export const getAllProgress = () => getItem('dsa_progress') || []

export const upsertProgress = (studentId, questionId, classroomId, status) => {
  const all = getAllProgress()
  const idx = all.findIndex(p =>
    p.studentId === studentId && p.questionId === questionId && p.classroomId === classroomId
  )
  const entry = {
    id: idx >= 0 ? all[idx].id : crypto.randomUUID(),
    studentId, questionId, classroomId, status,
    markedAt: new Date().toISOString(),
  }
  if (idx >= 0) all[idx] = entry; else all.push(entry)
  setItem('dsa_progress', all)
  return entry
}

export const getStudentProgress  = (sid, cid) => getAllProgress().filter(p => p.studentId === sid && p.classroomId === cid)
export const getClassroomProgress= (cid)       => getAllProgress().filter(p => p.classroomId === cid)

export const deleteStudentClassroomProgress = (sid, cid) => {
  setItem('dsa_progress', getAllProgress().filter(p => !(p.studentId === sid && p.classroomId === cid)))
}
