import api from './client'

// Fetch dashboard data with optional noCache flag to prevent caching
export const getDashboard = ({ noCache } = {}) => {
	const config = {
		headers: {
			'Cache-Control': 'no-store',
			Pragma: 'no-cache',
		},
		params: {},
	}
	if (noCache) config.params._t = Date.now()
	return api.get('/dashboard', config)
}
