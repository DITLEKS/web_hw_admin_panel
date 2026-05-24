import api from './client'
export const getOrders    = (params)      => api.get('/orders', { params })
export const getOrder     = (num)         => api.get(`/orders/${num}`)
export const updateStatus = (num, data)   => api.patch(`/orders/${num}/status`, data)
