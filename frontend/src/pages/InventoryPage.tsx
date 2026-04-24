import { useProducts } from '../features/products/hooks'
import { formatCurrency } from '../lib/utils/currency'

export function InventoryPage() {
  const { data, isLoading } = useProducts()
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Inventory</h1>
      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-3" colSpan={3}>
                  Loading...
                </td>
              </tr>
            ) : (
              data?.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{product.name}</td>
                  <td className="px-3 py-2">{formatCurrency(product.sellingPrice)}</td>
                  <td className="px-3 py-2">{product.stock}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
