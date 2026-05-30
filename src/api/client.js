import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
})

// Добавляем токен ко всем запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, Promise.reject)

// Refresh-логика с защитой от бесконечного цикла
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

const SKIP_REFRESH_PATHS = ['/auth/refresh', '/auth/login']

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isSkipped = SKIP_REFRESH_PATHS.some((p) => original.url?.includes(p))

    if (error.response?.status === 401 && !original._retry && !isSkipped) {
      if (isRefreshing) {
        // Ставим запрос в очередь до завершения refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          processQueue(new Error('no_refresh_token'), null)
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
          return Promise.reject(new Error('no_refresh_token'))
        }

        const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken })
        const newToken = data.data.access_token
        localStorage.setItem('access_token', newToken)
        // update refresh_token if backend returned a new one
        if (data.data.refresh_token) localStorage.setItem('refresh_token', data.data.refresh_token)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
