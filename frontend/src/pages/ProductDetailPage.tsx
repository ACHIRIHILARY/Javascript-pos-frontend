import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProduct, useAdjustProductStock } from '../features/products/hooks'
import { formatCurrency } from '../lib/utils/currency'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, error } = useProduct(id)
  const adjustStock = useAdjustProductStock()

  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustQuantity, setAdjustQuantity] = useState(0)
  const [adjustReason, setAdjustReason] = useState('')

  const handleAdjustStock = async () => {
    if (!id || adjustQuantity === 0) return
    try {
      await adjustStock.mutateAsync({
        id,
        payload: { quantity: adjustQuantity, reason: adjustReason },
      })
      setShowAdjustModal(false)
      setAdjustQuantity(0)
      setAdjustReason('')
    } catch (error) {
      console.error('Failed to adjust stock:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-slate-500">Loading product...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-4 text-lg text-red-600">Product not found</div>
        <Link
          to="/dashboard/inventory"
          className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
        >
          Back to Inventory
        </Link>
      </div>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/dashboard/inventory"
          className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
        >
          ← Back to Inventory
        </Link>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            {product.barcode && (
              <p className="mt-1 text-sm text-slate-500">Barcode: {product.barcode}</p>
            )}
          </div>
          <button
            onClick={() => setShowAdjustModal(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Adjust Stock
          </button>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-sm text-slate-500">Price</div>
            <div className="text-xl font-semibold text-slate-900">
              {formatCurrency(product.sellingPrice)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Current Stock</div>
            <div
              className={`text-xl font-semibold ${
                product.stock === 0
                  ? 'text-red-600'
                  : product.stock <= product.lowStockThreshold
                  ? 'text-amber-600'
                  : 'text-green-600'
              }`}
            >
              {product.stock}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Low Stock Threshold</div>
            <div className="text-xl font-semibold text-slate-900">{product.lowStockThreshold}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Category</div>
            <div className="text-xl font-semibold text-slate-900">
              {typeof product.category === 'object' ? product.category?.name : '-'}
            </div>
          </div>
        </div>

        {product.updatedAt && (
          <div className="mt-4 text-sm text-slate-500">
            Last updated: {new Date(product.updatedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Stock Movements */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Stock Movement History</h2>
        {product.stockMovements && product.stockMovements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium text-slate-700">Date</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Type</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Quantity</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Reason</th>
                </tr>
              </thead>
              <tbody>
                {product.stockMovements.map((movement) => (
                  <tr key={movement.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-600">
                      {movement.createdAt
                        ? new Date(movement.createdAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                          (movement.quantity ?? 0) > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {movement.type || (movement.quantity ?? 0) > 0 ? 'IN' : 'OUT'}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-2 font-medium ${
                        (movement.quantity ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {movement.quantity > 0 ? '+' : ''}
                      {movement.quantity}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{movement.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">No stock movements recorded</div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Adjust Stock</h2>
            <p className="mb-4 text-sm text-slate-600">
              Product: <strong>{product.name}</strong>
              <br />
              Current stock: <strong>{product.stock}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Quantity (+/-)
                </label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Stock count, Damaged goods"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={adjustStock.isPending || adjustQuantity === 0}
                className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {adjustStock.isPending ? 'Adjusting...' : 'Adjust'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
