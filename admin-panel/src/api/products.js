import api from './client'
export const getProducts   = (params) => api.get('/products', { params })
export const getProduct    = (sku)    => api.get(`/products/${sku}`)
export const createProduct = (data)   => api.post('/products', data)
export const updateProduct = (sku, data) => api.patch(`/products/${sku}`, data)
export const deleteProduct = (sku)   => api.delete(`/products/${sku}`)
