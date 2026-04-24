import { useSummary } from '../features/reports/hooks'
import { formatCurrency } from '../lib/utils/currency'

export function DashboardPage() {
  const { data } = useSummary('day')
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Today Revenue</div>
          <div className="text-lg font-semibold">{formatCurrency(data?.totalRevenue ?? 0)}</div>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Sales Today</div>
          <div className="text-lg font-semibold">{data?.totalSales ?? 0}</div>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Low Stock</div>
          <div className="text-lg font-semibold">{data?.lowStockCount ?? 0}</div>
        </div>
      </div>
    </section>
  )
}
