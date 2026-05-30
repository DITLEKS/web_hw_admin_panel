import { create } from 'zustand'

const safeParseUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = create((set) => ({
  user: safeParseUser(),
  token: localStorage.getItem('access_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('access_token', token)
    set({ user, token })
  },

  clearAuth: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, token: null })
  },
}))
