import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { logout } from '../../api/auth'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/products',  icon: Package,         label: 'Товары'   },
  { to: '/orders',    icon: ShoppingCart,    label: 'Заказы'   },
]

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logout() } catch {}
    clearAuth()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 200, minHeight: '100vh', background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
    }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>SmartLight</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Админ-панель</div>
      </div>
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 6, marginBottom: 2,
            color: isActive ? 'var(--text)' : 'var(--text2)',
            background: isActive ? 'var(--surface2)' : 'transparent',
            fontWeight: isActive ? 600 : 400, fontSize: 13,
            transition: 'all 150ms',
          })}>
            <Icon size={16} />{label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '8px 12px', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>{user?.email}</div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '8px 12px', borderRadius: 6,
          color: 'var(--danger)', fontSize: 13, background: 'transparent',
        }}>
          <LogOut size={15} /> Выйти
        </button>
      </div>
    </aside>
  )
}
