import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/index.jsx'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0e1a]">
      <div className="text-center">
        <div className="text-7xl font-black text-indigo-600 mb-3 font-syne">403</div>
        <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm mb-8">You don't have permission to view this page.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </div>
  )
}
