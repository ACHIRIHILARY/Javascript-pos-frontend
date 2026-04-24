import { useSales } from '../features/sales/hooks'
import { formatCurrency } from '../lib/utils/currency'
import { formatDateTime } from '../lib/utils/datetime'

export function SalesPage() {
  const { data, isLoading } = useSales()
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Sales</h1>
      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Sale ID</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-3" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : (
              data?.map((sale) => (
                <tr key={sale.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{sale.id}</td>
                  <td className="px-3 py-2">{formatDateTime(sale.createdAt)}</td>
                  <td className="px-3 py-2">{sale.paymentMethod}</td>
                  <td className="px-3 py-2">{formatCurrency(sale.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
