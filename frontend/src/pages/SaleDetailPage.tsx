import { useParams, Link } from 'react-router-dom'
import { useSale } from '../features/sales/hooks'
import { formatCurrency } from '../lib/utils/currency'

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: sale, isLoading, error } = useSale(id)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!sale) return
    const receipt = generateReceiptHtml(sale)
    const blob = new Blob([receipt], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${sale.id}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-slate-500">Loading sale...</div>
      </div>
    )
  }

  if (error || !sale) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-4 text-lg text-red-600">Sale not found</div>
        <Link
          to="/dashboard/sales"
          className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
        >
          Back to Sales
        </Link>
      </div>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/dashboard/sales"
          className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
        >
          ← Back to Sales
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sale #{sale.id}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {sale.createdAt ? new Date(sale.createdAt).toLocaleString() : '-'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Print
            </button>
            <button
              onClick={handleDownload}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Download
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-sm text-slate-500">Total</div>
            <div className="text-xl font-semibold text-slate-900">{formatCurrency(sale.total)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Payment Method</div>
            <div className="text-xl font-semibold text-slate-900">
              {sale.paymentMethod.replace('_', ' ')}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Cashier</div>
            <div className="text-xl font-semibold text-slate-900">{sale.cashierName || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Items</div>
            <div className="text-xl font-semibold text-slate-900">
              {sale.items?.length ?? 0}
            </div>
          </div>
        </div>

        {sale.note && (
          <div className="mt-4 rounded bg-slate-50 p-3">
            <div className="text-sm font-medium text-slate-700">Note</div>
            <div className="mt-1 text-sm text-slate-600">{sale.note}</div>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Items</h2>
        {sale.items && sale.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium text-slate-700">Product</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Quantity</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Unit Price</th>
                  <th className="px-3 py-2 font-medium text-slate-700">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={item.id ?? index} className="border-t border-slate-100">
                    <td className="px-3 py-3 text-slate-900">
                      {item.productName || item.productId}
                    </td>
                    <td className="px-3 py-3 text-slate-900">{item.quantity}</td>
                    <td className="px-3 py-3 text-slate-600">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-3 py-3 text-slate-900 font-medium">
                      {formatCurrency(item.subtotal ?? item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan={3} className="px-3 py-3 text-right font-medium text-slate-900">
                    Total
                  </td>
                  <td className="px-3 py-3 font-bold text-slate-900">{formatCurrency(sale.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">No items in this sale</div>
        )}
      </div>
    </section>
  )
}

function generateReceiptHtml(sale: {
  id: string
  total: number
  paymentMethod: string
  createdAt?: string
  cashierName?: string
  note?: string
  items?: Array<{ productName?: string; productId: string; quantity: number; unitPrice: number; subtotal?: number }>
}): string {
  const itemsHtml = sale.items
    ?.map(
      (item) => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.productName || item.productId} x ${item.quantity}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">$${((item.subtotal ?? item.unitPrice * item.quantity) || 0).toFixed(2)}</td>
    </tr>
  `
    )
    .join('') ?? ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - Sale #${sale.id}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
    h1 { text-align: center; }
    table { width: 100%; border-collapse: collapse; }
    .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Receipt</h1>
  <p style="text-align: center; color: #666;">Sale #${sale.id}</p>
  <p style="text-align: center; color: #666;">${sale.createdAt ? new Date(sale.createdAt).toLocaleString() : ''}</p>
  <table>
    ${itemsHtml}
  </table>
  <div class="total">
    <span>Total:</span>
    <span>$${(sale.total || 0).toFixed(2)}</span>
  </div>
  <p style="text-align: center; margin-top: 10px;">Payment: ${sale.paymentMethod.replace('_', ' ')}</p>
  ${sale.note ? `<p style="text-align: center; margin-top: 10px; font-style: italic;">Note: ${sale.note}</p>` : ''}
  <div class="footer">
    <p>Thank you for your purchase!</p>
  </div>
</body>
</html>
  `
}
