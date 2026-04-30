import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSales } from '../features/sales/hooks'
import { formatCurrency } from '../lib/utils/currency'
import { formatDateTime } from '../lib/utils/datetime'

export function SalesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSales(page, 20)

  const sales = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Sales</h1>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-3 font-medium text-slate-700">Sale ID</th>
              <th className="px-3 py-3 font-medium text-slate-700">Date</th>
              <th className="px-3 py-3 font-medium text-slate-700">Cashier</th>
              <th className="px-3 py-3 font-medium text-slate-700">Payment</th>
              <th className="px-3 py-3 font-medium text-slate-700">Total</th>
              <th className="px-3 py-3 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  No sales found
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="border-t border-slate-100">
                  <td className="px-3 py-3 text-slate-900">{sale.id}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {sale.createdAt ? formatDateTime(sale.createdAt) : '-'}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{sale.cashierName || '-'}</td>
                  <td className="px-3 py-3 text-slate-600">
                    <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {sale.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to={`/dashboard/sales/${sale.id}`}
                      className="text-sm text-slate-600 hover:text-slate-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
