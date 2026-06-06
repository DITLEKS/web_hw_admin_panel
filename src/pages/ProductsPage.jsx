import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, X } from 'lucide-react'
import { getProducts, deleteProduct } from '../api/products'
import StatusBadge from '../components/ui/StatusBadge'
import Pagination from '../components/ui/Pagination'

// Debounce hook — предотвращает запрос на каждый символ
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: 'led',      label: 'LED'      },
  { value: 'filament', label: 'Filament' },
  { value: 'smart',    label: 'Smart'    },
  { value: 'halogen',  label: 'Halogen'  },
]

const STATUS_OPTIONS = [
  { value: '',            label: 'Все статусы'   },
  { value: 'active',      label: 'Активен'        },
  { value: 'archived',    label: 'Архив'          },
  { value: 'out_of_stock',label: 'Нет в наличии' },
]

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [meta,     setMeta]     = useState({ total: 0, total_pages: 1 })
  const [page,     setPage]     = useState(1)
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('')
  const [status,   setStatus]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [loadError,setLoadError]= useState('')
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  const debouncedSearch = useDebounce(search)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params = { page, limit: 10 }
      if (debouncedSearch) params.search   = debouncedSearch
      if (category)        params.category = category
      if (status)          params.status   = status
      const { data } = await getProducts(params)
      setProducts(data.data)
      setMeta(data.meta)
    } catch {
      setLoadError('Не удалось загрузить товары. Проверьте соединение.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, category, status])

  useEffect(() => { load() }, [load])

  // Сбрасываем страницу при изменении фильтров
  useEffect(() => { setPage(1) }, [debouncedSearch, category, status])

  const handleDelete = async (sku) => {
    if (!confirm(`Удалить товар ${sku}?`)) return
    setDeleting(sku)
    try {
      await deleteProduct(sku)
      load()
    } catch {
      alert('Не удалось удалить товар')
    } finally {
      setDeleting(null)
    }
  }

  const hasFilters = search || category || status
  const resetFilters = () => { setSearch(''); setCategory(''); setStatus(''); setPage(1) }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Товары</h1>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={16} /> Добавить товар
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-field" style={{ position: 'relative', flex: '1 1 420px', minWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или SKU..."
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 140 }}>
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 160 }}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
              <X size={13} /> Сбросить
            </button>
          )}
        </div>

        {loadError && <div className="alert alert-error">{loadError}</div>}

        {loading
          ? <div className="loading-center"><span className="spinner" /></div>
          : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Фото</th><th>SKU</th><th>Название</th><th>Тип</th>
                    <th>Цена</th><th>Остаток</th><th>Статус</th><th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.sku}>
                      <td>
                        {p.primary_image
                          ? <img src={p.primary_image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                          : <div style={{ width: 40, height: 40, background: 'var(--surface2)', borderRadius: 6 }} />
                        }
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)' }}>{p.sku}</td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td><span className="badge badge-blue">{p.category?.name}</span></td>
                      <td>{Number(p.price).toLocaleString()} ₽</td>
                      <td style={{ color: p.stock_quantity <= 5 ? 'var(--danger)' : p.stock_quantity <= 10 ? 'var(--warning)' : 'var(--text)' }}>
                        {p.stock_quantity} шт
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/products/${p.sku}/edit`)}
                            aria-label="Редактировать"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#ef444420', color: 'var(--danger)' }}
                            onClick={() => handleDelete(p.sku)}
                            disabled={deleting === p.sku}
                            aria-label="Удалить"
                          >
                            {deleting === p.sku
                              ? <span className="spinner" style={{ width: 12, height: 12 }} />
                              : <Trash2 size={13} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
                        {hasFilters ? 'Ничего не найдено. Попробуйте изменить фильтры.' : 'Товары отсутствуют'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span style={{ color: 'var(--text2)', fontSize: 12 }}>
                  Показано {products.length} из {meta.total} товаров
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
