const MAP = {
  created:     { label: 'В обработке',    cls: 'badge-yellow' },
  confirmed:   { label: 'Подтверждён',    cls: 'badge-blue'   },
  in_assembly: { label: 'Сборка',         cls: 'badge-blue'   },
  shipped:     { label: 'Доставляется',   cls: 'badge-blue'   },
  delivered:   { label: 'Доставлен',      cls: 'badge-green'  },
  cancelled:   { label: 'Отменён',        cls: 'badge-red'    },
  active:      { label: 'Активен',        cls: 'badge-green'  },
  archived:    { label: 'Архив',          cls: 'badge-gray'   },
  out_of_stock:{ label: 'Нет в наличии',  cls: 'badge-red'    },
}
export default function StatusBadge({ status }) {
  const { label, cls } = MAP[status] || { label: status, cls: 'badge-gray' }
  return <span className={`badge ${cls}`}>{label}</span>
}
