import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { getOrders } from '../api/orders'
import StatusBadge from '../components/ui/StatusBadge'
import Pagination from '../components/ui/Pagination'

const STATUSES = [
  { value: 'created',     label: 'В обработке' },
  { value: 'confirmed',   label: 'Подтверждён' },
  { value: 'in_assembly', label: 'Сборка'       },
  { value: 'shipped',     label: 'Доставляется' },
  { value: 'delivered',   label: 'Доставлен'    },
  { value: 'cancelled',   label: 'Отменён'      },
]

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function OrdersPage() {
  const [orders,    setOrders]   = useState([])
  const [meta,      setMeta]     = useState({ total: 0, total_pages: 1 })
  const [page,      setPage]     = useState(1)
  const [status,    setStatus]   = useState('')
  const [search,    setSearch]   = useState('')
  const [loading,   setLoading]  = useState(true)
  const [loadError, setLoadError]= useState('')

  const debouncedSearch = useDebounce(search)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params = { page, limit: 10 }
      if (status)          params.status = status
      // Поиск передаётся на сервер — работает по всем страницам
      if (debouncedSearch) params.search = debouncedSearch
      const { data } = await getOrders(params)
      setOrders(data.data)
      setMeta(data.meta)
    } catch {
      setLoadError('Не удалось загрузить заказы')
    } finally {
      setLoading(false)
    }
  }, [page, status, debouncedSearch])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [status, debouncedSearch])

  const hasFilters = status || search
  const resetFilters = () => { setStatus(''); setSearch(''); setPage(1) }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Заказы</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по номеру заказа или email..."
              style={{ paddingLeft: 32 }}
            />
          </div>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
              <X size={13} /> Сбросить
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${!status ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setStatus(''); setPage(1) }}
          >
            Все
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              className={`btn btn-sm ${status === s.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setStatus(s.value); setPage(1) }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loadError && <div className="alert alert-error">{loadError}</div>}

        {loading
          ? <div className="loading-center"><span className="spinner" /></div>
          : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>№ Заказа</th><th>Дата</th><th>Покупатель</th>
                    <th>Сумма</th><th>Статус</th><th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_number}>
                      <td style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{o.order_number}</td>
                      <td style={{ color: 'var(--text2)', fontSize: 13 }}>
                        {new Date(o.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{o.customer?.first_name} {o.customer?.last_name}</div>
                        <div style={{ color: 'var(--text2)', fontSize: 12 }}>{o.customer?.email}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{Number(o.total_amount).toLocaleString()} ₽</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>
                        <Link to={`/orders/${o.order_number}`} className="btn btn-ghost btn-sm">
                          Открыть
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
                        {hasFilters ? 'Заказы по заданным фильтрам не найдены' : 'Заказов пока нет'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span style={{ color: 'var(--text2)', fontSize: 12 }}>
                  Показано {orders.length} из {meta.total} заказов
                </span>
                <Pagination page={page} totalPages={meta.total_pages || 1} onChange={setPage} />
              </div>
            </>
          )
        }
      </div>
    </>
  )
}
