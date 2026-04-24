import { useParams } from 'react-router-dom'

export function ProductDetailPage() {
  const { id } = useParams()
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Product Detail</h1>
      <div className="rounded border border-slate-200 bg-white p-4 text-sm">Product ID: {id}</div>
    </section>
  )
}
