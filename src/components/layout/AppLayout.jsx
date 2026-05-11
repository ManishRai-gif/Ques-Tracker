import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Icons } from '../shared/Icons'

export function AppLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0eefc]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-700"
            aria-label="Open menu"
          >
            <Icons.Menu />
          </button>
          <span className="font-bold text-gray-900 font-syne">DSA Tracker</span>
        </div>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
