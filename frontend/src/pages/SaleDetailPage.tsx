import { useParams } from 'react-router-dom'

export function SaleDetailPage() {
  const { id } = useParams()
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Sale Detail</h1>
      <div className="rounded border border-slate-200 bg-white p-4 text-sm">Sale ID: {id}</div>
    </section>
  )
}
