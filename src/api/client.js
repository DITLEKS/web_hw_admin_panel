import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
})

const SKIP_REFRESH_PATHS = ['/auth/login', '/auth/refresh']

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {}
    const status = error.response?.status
    const url = original.url || ''
    const isSkipped = SKIP_REFRESH_PATHS.some((p) => url.includes(p))

    if (status !== 401 || original._retry || isSkipped) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      const { data } = await axios.post('/api/v1/auth/refresh', {
        refresh_token: refreshToken,
      })

      const payload = data?.data ?? data
      const newAccessToken = payload?.access_token

      if (!newAccessToken) {
        throw new Error('No access token in refresh response')
      }

      localStorage.setItem('access_token', newAccessToken)

      if (payload?.refresh_token) {
        localStorage.setItem('refresh_token', payload.refresh_token)
      }

      original.headers = original.headers || {}
      original.headers.Authorization = `Bearer ${newAccessToken}`

      return api(original)
    } catch (refreshError) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  }
)

export default api