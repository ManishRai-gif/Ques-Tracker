import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import { ToastProvider }   from './context/ToastContext'
import { PrivateRoute, RoleRoute } from './routes/guards'
import { AppLayout }       from './components/layout/AppLayout'
import { LoginPage }       from './pages/LoginPage'
import { RegisterPage }    from './pages/RegisterPage'
import { DashboardPage }   from './pages/DashboardPage'
import { CreateClassroomPage }  from './pages/CreateClassroomPage'
import { ManageClassroomPage }  from './pages/ManageClassroomPage'
import { ClassroomDetailPage }  from './pages/ClassroomDetailPage'
import { LeaderboardPage }      from './pages/LeaderboardPage'
import { StudentProgressPage }  from './pages/StudentProgressPage'
import { UnauthorizedPage }     from './pages/UnauthorizedPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/register"     element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Private — wrapped in AppLayout */}
            <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="classroom/:classroomId" element={<ClassroomDetailPage />} />
              <Route path="classroom/:classroomId/leaderboard" element={<LeaderboardPage />} />

              {/* Admin only */}
              <Route path="admin/classroom/create"
                element={<RoleRoute role="admin"><CreateClassroomPage /></RoleRoute>} />
              <Route path="admin/classroom/:classroomId/manage"
                element={<RoleRoute role="admin"><ManageClassroomPage /></RoleRoute>} />

              {/* Student only */}
              <Route path="student/progress/:classroomId"
                element={<RoleRoute role="student"><StudentProgressPage /></RoleRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
