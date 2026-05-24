export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = []
  for (let i = 1; i <= Math.min(totalPages, 7); i++) pages.push(i)
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>←</button>
      {pages.map(p => (
        <button key={p} className={page === p ? 'active' : ''} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}>→</button>
    </div>
  )
}
