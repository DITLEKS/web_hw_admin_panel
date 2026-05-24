import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Check } from 'lucide-react'
import { getOrder, updateStatus } from '../api/orders'
import StatusBadge from '../components/ui/StatusBadge'

const STATUSES = [
  { value: 'created',     label: 'В обработке'  },
  { value: 'confirmed',   label: 'Подтверждён'  },
  { value: 'in_assembly', label: 'Сборка'        },
  { value: 'shipped',     label: 'Доставляется'  },
  { value: 'delivered',   label: 'Доставлен'     },
  { value: 'cancelled',   label: 'Отменён'       },
]

export default function OrderDetailPage() {
  const { orderNumber } = useParams()
  const [order,      setOrder]     = useState(null)
  const [loading,    setLoading]   = useState(true)
  const [error,      setError]     = useState('')
  const [newStatus,  setNewStatus] = useState('')
  const [comment,    setComment]   = useState('')
  const [tracking,   setTracking]  = useState('')
  const [saving,     setSaving]    = useState(false)
  // Отдельный стейт для типа уведомления — не хрупкое сравнение строки
  const [alert,      setAlert]     = useState(null) // { type: 'success'|'error', text: string }

  const loadOrder = useCallback(() => {
    setLoading(true)
    setError('')
    getOrder(orderNumber)
      .then(({ data }) => {
        setOrder(data.data)
        setNewStatus(data.data.status)
      })
      .catch(() => setError('Не удалось загрузить заказ'))
      .finally(() => setLoading(false))
  }, [orderNumber])

  useEffect(() => { loadOrder() }, [loadOrder])

  const handleStatusUpdate = async () => {
    setSaving(true)
    setAlert(null)
    try {
      await updateStatus(orderNumber, {
        status: newStatus,
        ...(tracking && { tracking_number: tracking }),
        ...(comment  && { comment }),
      })
      setAlert({ type: 'success', text: 'Статус успешно обновлён' })
      setComment('')
      loadOrder()
    } catch (err) {
      const d = err.response?.data
      const text = typeof d?.detail === 'string'
        ? d.detail
        : d?.detail?.message || d?.message || 'Ошибка при обновлении статуса'
      setAlert({ type: 'error', text })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-center"><span className="spinner" /> Загрузка...</div>
  if (error)   return <div className="loading-center" style={{ color: 'var(--danger)' }}>{error}</div>
  if (!order)  return <div className="loading-center">Заказ не найден</div>

  const c = order.customer || {}
  const isSameStatus = newStatus === order.status

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text2)', fontSize: 13, marginBottom: 8 }}>
          <ChevronLeft size={14} /> Назад к заказам
        </Link>
        <h1 className="page-title">Заказ № {order.order_number}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>👤 Данные покупателя</div>
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div><span style={{ color: 'var(--text2)' }}>Имя: </span>{c.first_name} {c.last_name}</div>
            <div><span style={{ color: 'var(--text2)' }}>Email: </span>{c.email}</div>
            {c.phone && <div><span style={{ color: 'var(--text2)' }}>Телефон: </span>{c.phone}</div>}
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>🚚 Доставка</div>
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div><span style={{ color: 'var(--text2)' }}>Способ: </span>{order.delivery_type}</div>
            {order.delivery_city   && <div><span style={{ color: 'var(--text2)' }}>Город: </span>{order.delivery_city}</div>}
            {order.delivery_street && <div><span style={{ color: 'var(--text2)' }}>Адрес: </span>{order.delivery_street}</div>}
            {order.tracking_number && <div><span style={{ color: 'var(--text2)' }}>Трек: </span>{order.tracking_number}</div>}
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>💳 Оплата</div>
          <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div><span style={{ color: 'var(--text2)' }}>Способ: </span>{order.payment_method}</div>
            <div>
              <span style={{ color: 'var(--text2)' }}>Статус: </span>
              <span style={{ color: order.payment_status === 'paid' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                {order.payment_status === 'paid' ? 'Оплачено' : 'Ожидает оплаты'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Управление статусом заказа</div>
        <div style={{ marginBottom: 12, fontSize: 13 }}>
          Текущий статус: <StatusBadge status={order.status} />
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>{alert.text}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Изменить статус</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Трек-номер</label>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="SDEK-123456" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Комментарий оператора</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
            placeholder="Добавьте комментарий к изменению статуса..." />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleStatusUpdate}
          disabled={saving || isSameStatus}
          title={isSameStatus ? 'Статус не изменился' : ''}
        >
          {saving
            ? <span className="spinner" style={{ width: 16, height: 16 }} />
            : <><Check size={15} /> Применить</>
          }
        </button>
      </div>

      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Состав заказа</div>
        <table>
          <thead>
            <tr>
              <th>SKU</th><th>Название</th><th>Кол-во</th><th>Цена</th><th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              // Используем sku как стабильный ключ вместо индекса массива
              <tr key={item.sku || item.product_id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' }}>{item.sku}</td>
                <td>{item.name}</td>
                <td>{item.quantity} шт.</td>
                <td>{Number(item.unit_price).toLocaleString()} ₽</td>
                <td style={{ fontWeight: 600 }}>{Number(item.total_price).toLocaleString()} ₽</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, fontSize: 13 }}>
          <div style={{ color: 'var(--text2)' }}>Подытог: {Number(order.subtotal || 0).toLocaleString()} ₽</div>
          {Number(order.discount_amount) > 0 && (
            <div style={{ color: 'var(--success)' }}>Скидка: −{Number(order.discount_amount).toLocaleString()} ₽</div>
          )}
          <div style={{ color: 'var(--text2)' }}>Доставка: {Number(order.delivery_cost || 0).toLocaleString()} ₽</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Итого: {Number(order.total_amount).toLocaleString()} ₽</div>
        </div>
      </div>
    </>
  )
}
