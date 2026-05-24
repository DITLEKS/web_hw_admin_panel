import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import ProductFormPage from './pages/ProductFormPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route element={<AppLayout/>}>
          <Route path="/dashboard" element={<DashboardPage/>}/>
          <Route path="/products"           element={<ProductsPage/>}/>
          <Route path="/products/new"       element={<ProductFormPage/>}/>
          <Route path="/products/:sku/edit" element={<ProductFormPage/>}/>
          <Route path="/orders"             element={<OrdersPage/>}/>
          <Route path="/orders/:orderNumber" element={<OrderDetailPage/>}/>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
