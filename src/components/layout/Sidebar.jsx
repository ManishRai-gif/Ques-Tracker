import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icons } from '../shared/Icons'

export function Sidebar({ open, onClose }) {
  const { currentUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const go = (to) => { navigate(to); if (window.innerWidth < 768) onClose() }
  const isActive = (p) => pathname === p || pathname.startsWith(p + '/')

  const linkCls = (p) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${
      isActive(p)
        ? 'sidebar-active'
        : 'text-gray-400 hover:text-white hover:bg-white/[0.08]'
    }`

  return (
    <>
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-[220px] flex flex-col bg-[#0f0e1a] transition-transform duration-300 ease-out shadow-2xl md:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm font-syne">
            D
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-none font-syne">DSA Tracker</div>
            <div className="text-gray-600 text-[10px] mt-0.5">Classroom</div>
          </div>
        </div>

        <div className="h-px bg-white/[0.06] mx-4 mb-3" />

        {/* Nav links */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
          <div onClick={() => go('/dashboard')} className={linkCls('/dashboard')}>
            <Icons.Grid /> Dashboard
          </div>

          {isAdmin ? (
            <>
              <div className="px-3 pt-4 pb-1">
                <span className="text-[10px] text-gray-600 uppercase tracking-[0.12em] font-semibold">Admin</span>
              </div>
              <div onClick={() => go('/admin/classroom/create')} className={linkCls('/admin/classroom/create')}>
                <Icons.Plus size={18} /> Create Classroom
              </div>
            </>
          ) : (
            <>
              <div className="px-3 pt-4 pb-1">
                <span className="text-[10px] text-gray-600 uppercase tracking-[0.12em] font-semibold">Student</span>
              </div>
              <div onClick={() => go('/dashboard')} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-all">
                <Icons.Join /> Join Classroom
              </div>
            </>
          )}
        </nav>

        <div className="h-px bg-white/[0.06] mx-4 mb-3" />

        {/* User section */}
        <div className="p-3 pb-5">
          <div className="flex items-center gap-3 mb-2 px-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {currentUser?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{currentUser?.name}</div>
              <div className="text-gray-500 text-[10px]">
                {currentUser?.role === 'admin' ? 'Teacher' : 'Student'}
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-white/[0.06] hover:text-red-400 transition-colors"
          >
            <Icons.Logout /> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
