import api from './client'

export const login = async (email, password) => {
	const res = await api.post('/auth/login', { email, password })
	// Сохраняем refresh_token, если backend его вернул
	const rt = res?.data?.data?.refresh_token
	if (rt) localStorage.setItem('refresh_token', rt)
	return res
}

export const logout = () => api.post('/auth/logout')

export const refresh = () => api.post('/auth/refresh', { refresh_token: localStorage.getItem('refresh_token') })
