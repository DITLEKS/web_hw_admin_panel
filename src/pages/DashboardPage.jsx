import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react'
import { getDashboard } from '../api/dashboard'
import StatusBadge from '../components/ui/StatusBadge'

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card" style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
      <div style={{ width:40, height:40, borderRadius:8, background:color+'20', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={color}/>
      </div>
      <div>
        <div style={{ color:'var(--text2)', fontSize:12, marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:24, fontWeight:700 }}>{value}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { getDashboard().then(r=>setData(r.data.data)).finally(()=>setLoading(false)) }, [])
  if (loading) return <div className="loading-center"><span className="spinner"/> Загрузка...</div>
  if (!data)   return <div className="loading-center">Ошибка загрузки</div>
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Дашборд</h1>
        <span style={{ color:'var(--text2)', fontSize:13 }}>{new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <KpiCard icon={ShoppingCart} label="Заказов всего"    value={data.today.orders_count} color="#3b82f6"/>
        <KpiCard icon={DollarSign}   label="Выручка"          value={Number(data.today.revenue).toLocaleString()+' ₽'} color="#22c55e"/>
        <KpiCard icon={Package}      label="Мало на складе"   value={data.low_stock.length+' товаров'} color="#f59e0b"/>
        <KpiCard icon={Users}        label="Новых клиентов"   value={data.today.new_customers} color="#a855f7"/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:16 }}>Последние заказы</div>
          {data.recent_orders.length===0
            ? <p style={{color:'var(--text2)'}}>Нет заказов</p>
            : data.recent_orders.map(o=>(
              <div key={o.order_number} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <Link to={`/orders/${o.order_number}`} style={{ fontWeight:500, color:'var(--accent)', fontSize:13 }}>{o.order_number}</Link>
                  <div style={{ color:'var(--text2)', fontSize:12 }}>{o.customer_email}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:600 }}>{Number(o.total_amount).toLocaleString()} ₽</div>
                  <StatusBadge status={o.status}/>
                </div>
              </div>
            ))
          }
        </div>
        <div className="card">
          <div style={{ fontWeight:600, marginBottom:16 }}>Заканчивается на складе</div>
          {data.low_stock.length===0
            ? <p style={{color:'var(--text2)'}}>Всё в наличии</p>
            : data.low_stock.map(p=>(
              <div key={p.sku} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight:500, fontSize:13 }}>{p.name}</div>
                  <div style={{ color:'var(--text2)', fontSize:11 }}>{p.sku}</div>
                </div>
                <span style={{ color: p.stock_quantity<=5?'var(--danger)':'var(--warning)', fontWeight:700 }}>{p.stock_quantity} шт</span>
              </div>
            ))
          }
        </div>
      </div>
    </>
  )
}
