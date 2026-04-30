import { Link } from 'react-router-dom'
import { useSummary } from '../features/reports/hooks'
import { formatCurrency } from '../lib/utils/currency'

export function DashboardPage() {
  const { data, isLoading, isError } = useSummary('day')
  const quickLinks = [
    { to: '/dashboard/inventory', label: 'Inventory' },
    { to: '/pos', label: 'POS' },
    { to: '/dashboard/reports', label: 'Reports' },
    { to: '/dashboard/users', label: 'Users' },
  ]
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
      {isLoading ? (
        <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading summary...</p>
      ) : null}
      {isError ? (
        <p className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load summary metrics right now.
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
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
        <div className="rounded border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Average Sale Value</div>
          <div className="text-lg font-semibold">{formatCurrency(data?.averageSaleValue ?? 0)}</div>
        </div>
      </div>
      <h2 className="mb-3 mt-6 text-lg font-semibold">Quick links</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
