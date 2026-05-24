import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 200, flex: 1, minHeight: '100vh', padding: 32 }}>
        <Outlet />
      </main>
    </div>
  )
}
