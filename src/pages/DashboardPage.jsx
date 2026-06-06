import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react'
import { getDashboard } from '../api/dashboard'
import { getOrders } from '../api/orders'
import StatusBadge from '../components/ui/StatusBadge'

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: color + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ordersTotal, setOrdersTotal] = useState(null)

  const loadDashboard = () => {
    setLoading(true)

    getDashboard({ noCache: true })
      .then((r) => {
        const payload = r.data?.data ?? r.data
        setData(payload)

        try {
          getOrders({ page: 1, limit: 1, _t: Date.now() })
            .then(({ data }) => {
              const meta = data?.meta ?? {}
              if (meta.total != null) {
                setOrdersTotal(meta.total)
              }
            })
            .catch(() => {})
        } catch (e) {}
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="loading-center">
        <span className="spinner" /> Загрузка...
      </div>
    )
  }

  if (!data) {
    return <div className="loading-center">Ошибка загрузки</div>
  }

  const recentOrders = data.recent_orders ?? []
  const orders = Array.isArray(data) ? data : data.orders ?? []

  const lowStock = (data.low_stock ?? data.products ?? []).filter(
    (p) => Number(p?.stock_quantity || 0) < 10
  )

  const ordersCount =
    data?.orders_count ??
    ordersTotal ??
    (Array.isArray(orders) ? orders.length : 0)

  const revenue = Number(data?.revenue ?? 0)

  const newCustomers =
    data?.new_customers ??
    (() => {
      const arr = Array.isArray(orders) ? orders : []
      const emails = new Set()

      arr.forEach((o) => {
        const raw = o.customer_email || o.customer?.email || ''
        const email = String(raw).toLowerCase().trim()
        if (email) emails.add(email)
      })

      return emails.size
    })()

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Дашборд</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={loadDashboard}>
            Обновить
          </button>
          <span style={{ color: 'var(--text2)', fontSize: 13 }}>
            {new Date().toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard
          icon={ShoppingCart}
          label="Заказов всего"
          value={ordersCount}
          color="#3b82f6"
        />
        <KpiCard
          icon={DollarSign}
          label="Выручка"
          value={revenue.toLocaleString() + ' ₽'}
          color="#22c55e"
        />
        <KpiCard
          icon={Package}
          label="Мало на складе"
          value={lowStock.length + ' товаров'}
          color="#f59e0b"
        />
        <KpiCard
          icon={Users}
          label="Новых клиентов"
          value={newCustomers}
          color="#a855f7"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Последние заказы</div>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text2)' }}>Нет заказов</p>
          ) : (
            recentOrders.map((o) => (
              <div
                key={o.order_number}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <Link
                    to={`/orders/${o.order_number}`}
                    style={{ fontWeight: 500, color: 'var(--accent)', fontSize: 13 }}
                  >
                    {o.order_number}
                  </Link>
                  <div style={{ color: 'var(--text2)', fontSize: 12 }}>
                    {o.customer_email ?? o.customer?.email}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>
                    {Number(o.total_amount).toLocaleString()} ₽
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Заканчивается на складе</div>
          {lowStock.length === 0 ? (
            <p style={{ color: 'var(--text2)' }}>Всё в наличии</p>
          ) : (
            lowStock.map((p) => (
              <div
                key={p.sku}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 11 }}>{p.sku}</div>
                </div>
                <span
                  style={{
                    color: p.stock_quantity <= 5 ? 'var(--danger)' : 'var(--warning)',
                    fontWeight: 700,
                  }}
                >
                  {p.stock_quantity} шт
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}