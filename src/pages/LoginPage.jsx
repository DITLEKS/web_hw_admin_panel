import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { login } from '../api/auth'
import { useAuthStore } from '../store/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(email, password)
      const payload = response.data?.data ?? response.data

      const user = payload?.user
      const accessToken = payload?.access_token
      const refreshToken = payload?.refresh_token

      if (!accessToken) {
        throw new Error('access_token не пришёл в ответе login')
      }

      setAuth(user, accessToken)

      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }

      navigate('/dashboard')
    } catch (err) {
      const resp = err.response?.data
      const message =
        resp?.message ||
        resp?.error ||
        (typeof resp?.detail === 'string'
          ? resp.detail
          : resp?.detail?.message) ||
        err.message ||
        'Ошибка входа'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '40px 36px',
          width: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,.4)',
          color: '#1e293b',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
            SmartLight
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Панель управления
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartlight.ru"
              required
              style={{
                background: '#f8fafc',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
              Пароль
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  background: '#f8fafc',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  paddingRight: 40,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: 11,
              marginTop: 8,
            }}
          >
            {loading ? (
              <span className="spinner" style={{ width: 16, height: 16 }} />
            ) : (
              'Войти'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}