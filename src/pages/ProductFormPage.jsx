import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getProduct, createProduct, updateProduct } from '../api/products'

const CATEGORIES = [
  { id: 1, label: 'LED'      },
  { id: 2, label: 'Filament' },
  { id: 3, label: 'Smart'    },
  { id: 4, label: 'Halogen'  },
]

const STATUS_OPTIONS = [
  { value: 'active',       label: 'Активен'        },
  { value: 'archived',     label: 'Архив'          },
  { value: 'out_of_stock', label: 'Нет в наличии'  },
]

const EMPTY_FORM = {
  sku: '', category_id: 1, name: '', description: '',
  price: '', old_price: '', stock_quantity: 0, status: 'active',
  primary_image: '',
}

export default function ProductFormPage() {
  const { sku }  = useParams()
  const isEdit   = !!sku && sku !== 'new'
  const navigate = useNavigate()

  const [form,        setForm]       = useState(EMPTY_FORM)
  const [previewImage,setPreviewImage]= useState('')
  const [loading,     setLoading]    = useState(isEdit)
  const [loadError,   setLoadError]  = useState('')
  const [saving,      setSaving]     = useState(false)
  const [saveError,   setSaveError]  = useState('')

  useEffect(() => {
    if (!isEdit) return
    getProduct(sku)
      .then(({ data }) => {
        const p = data.data
        setForm({
          sku:            p.sku,
          category_id:    p.category?.id ?? 1,
          name:           p.name,
          description:    p.description || '',
          price:          p.price,
          old_price:      p.old_price || '',
          stock_quantity: p.stock_quantity,
          status:         p.status,
          primary_image:  p.primary_image || '',
        })
        setPreviewImage(p.primary_image || '')
      })
      .catch(() => setLoadError('Не удалось загрузить данные товара'))
      .finally(() => setLoading(false))
  }, [sku, isEdit])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleFileChange = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setField('primary_image', result)
        setPreviewImage(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)
    try {
      const body = {
        ...form,
        price:          parseFloat(form.price),
        old_price:      form.old_price ? parseFloat(form.old_price) : null,
        stock_quantity: parseInt(form.stock_quantity, 10),
        ...(form.primary_image ? { primary_image: form.primary_image } : {}),
      }
      if (!isEdit) {
        await createProduct(body)
      } else {
        // SKU не отправляем в PATCH — он в URL
        const { sku: _omit, ...patch } = body
        await updateProduct(sku, patch)
      }
      navigate('/products')
    } catch (err) {
      const d = err.response?.data
      const message =
        d?.message ||
        d?.details?.[0] ||
        d?.detail ||
        'Ошибка при сохранении'
      setSaveError(typeof message === 'string' ? message : 'Ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  if (loading)   return <div className="loading-center"><span className="spinner" /> Загрузка...</div>
  if (loadError) return <div className="loading-center" style={{ color: 'var(--danger)' }}>{loadError}</div>

  return (
    <>
      <div className="page-header">
        <div>
          <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text2)', fontSize: 13, marginBottom: 6 }}>
            <ChevronLeft size={14} /> Назад к списку товаров
          </Link>
          <h1 className="page-title">{isEdit ? `Редактирование: ${sku}` : 'Новый товар'}</h1>
        </div>
      </div>

      {saveError && <div className="alert alert-error">{saveError}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Основное</div>

            {!isEdit && (
              <div className="form-group">
                <label className="form-label" htmlFor="sku">SKU *</label>
                <input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => setField('sku', e.target.value)}
                  placeholder="LX-LED-E27-9W"
                  required
                  pattern="[A-Z0-9\-]+"
                  title="Только заглавные буквы, цифры и дефис"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="name">Название *</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">Категория</label>
              <select id="category" value={form.category_id} onChange={(e) => setField('category_id', parseInt(e.target.value, 10))}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Описание</label>
              <textarea id="description" value={form.description} onChange={(e) => setField('description', e.target.value)} rows={4} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="primary_image">Фото товара</label>
              <input
                id="primary_image"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
              {previewImage && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 6 }}>Превью</div>
                  <img
                    src={previewImage}
                    alt="Фото товара"
                    style={{ width: '100%', maxWidth: 240, height: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="price">Цена (₽) *</label>
                <input id="price" type="number" value={form.price} onChange={(e) => setField('price', e.target.value)} step="0.01" min="0.01" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="old_price">Старая цена (₽)</label>
                <input id="old_price" type="number" value={form.old_price} onChange={(e) => setField('old_price', e.target.value)} step="0.01" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="stock">Остаток (шт)</label>
                <input id="stock" type="number" value={form.stock_quantity} onChange={(e) => setField('stock_quantity', e.target.value)} min="0" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Статус товара</div>
              {STATUS_OPTIONS.map((s) => (
                <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    value={s.value}
                    checked={form.status === s.value}
                    onChange={() => setField('status', s.value)}
                  />
                  {s.label}
                </label>
              ))}
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
              {saving
                ? <span className="spinner" style={{ width: 16, height: 16 }} />
                : (isEdit ? 'Сохранить изменения' : 'Создать товар')
              }
            </button>
            <Link to="/products" className="btn btn-ghost" style={{ textAlign: 'center', justifyContent: 'center' }}>
              Отмена
            </Link>
          </div>
        </div>
      </form>
    </>
  )
}
