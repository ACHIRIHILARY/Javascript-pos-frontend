import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../features/products/hooks'
import { useCreateSale } from '../features/sales/hooks'
import { formatCurrency } from '../lib/utils/currency'
import type { Product } from '../lib/types/domain'
import type { PaymentMethod, CreateSalePayload } from '../features/sales/api'

type CartItem = {
  product: Product
  quantity: number
}

export function POSPage() {
  const { data: products, isLoading: productsLoading } = useProducts()
  const createSale = useCreateSale()
  
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<{ id: string; total: number; items: CartItem[] } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [note, setNote] = useState('')

  const filteredProducts = useMemo(() => {
    if (!products) return []
    const term = search.toLowerCase().trim()
    if (!term) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term)
    )
  }, [products, search])

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0),
    [cart]
  )

  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = Math.max(0, Math.min(item.quantity + delta, item.product.stock))
            return newQty === 0 ? null : { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item): item is CartItem => item !== null)
    )
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const handleCheckout = async () => {
    if (cart.length === 0) return
    
    const payload: CreateSalePayload = {
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice,
      })),
      paymentMethod,
      note: note || undefined,
    }

    try {
      const sale = await createSale.mutateAsync(payload)
      setLastSale({
        id: sale.id,
        total: sale.total,
        items: cart,
      })
      setCart([])
      setNote('')
      setShowReceipt(true)
    } catch (error) {
      console.error('Checkout failed:', error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!lastSale) return
    const receipt = generateReceiptHtml(lastSale, paymentMethod)
    const blob = new Blob([receipt], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${lastSale.id}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const closeReceipt = () => {
    setShowReceipt(false)
    setLastSale(null)
  }

  if (productsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-slate-500">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col border-r border-slate-200">
        {/* Search Bar */}
        <div className="border-b border-slate-200 bg-white p-4">
          <input
            type="text"
            placeholder="Search products by name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg focus:border-slate-500 focus:outline-none"
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="flex flex-col rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="mb-1 truncate text-sm font-medium text-slate-900">
                  {product.name}
                </div>
                <div className="text-lg font-semibold text-slate-700">
                  {formatCurrency(product.sellingPrice)}
                </div>
                <div
                  className={`mt-1 text-xs ${
                    product.stock === 0
                      ? 'text-red-600'
                      : product.stock <= product.lowStockThreshold
                      ? 'text-amber-600'
                      : 'text-green-600'
                  }`}
                >
                  {product.stock === 0
                    ? 'Out of stock'
                    : product.stock <= product.lowStockThreshold
                    ? `Low stock: ${product.stock}`
                    : `Stock: ${product.stock}`}
                </div>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              {search ? 'No products found' : 'No products available'}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="flex w-full flex-col bg-slate-50 lg:w-96">
        {/* Cart Header */}
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Cart</h2>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
              {cartItemCount} items
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-center text-slate-500">Cart is empty</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {cart.map((item) => (
                <li key={item.product.id} className="bg-white px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatCurrency(item.product.sellingPrice)} each
                      </div>
                    </div>
                    <div className="ml-2 text-sm font-medium text-slate-900">
                      {formatCurrency(item.product.sellingPrice * item.quantity)}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="ml-auto text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cart Footer */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg text-slate-600">Total</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(cartTotal)}</span>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Payment Method
            </label>
            <div className="flex gap-2">
              {(['CASH', 'CARD', 'MOBILE_MONEY'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    paymentMethod === method
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {method.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || createSale.isPending}
            className="w-full rounded-lg bg-slate-900 py-4 text-lg font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {createSale.isPending ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Receipt</h2>
              <p className="text-sm text-slate-500">Sale #{lastSale.id}</p>
            </div>

            <div className="mb-4 border-b border-slate-200 pb-4">
              <h3 className="mb-2 font-semibold">Items</h3>
              <ul className="divide-y divide-slate-100">
                {lastSale.items.map((item) => (
                  <li key={item.product.id} className="flex justify-between py-1">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>{formatCurrency(item.product.sellingPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(lastSale.total)}</span>
            </div>

            <div className="mb-6 flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Print
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Download
              </button>
              <button
                onClick={closeReceipt}
                className="flex-1 rounded-lg bg-slate-900 py-2 font-medium text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function generateReceiptHtml(
  sale: { id: string; total: number; items: CartItem[] },
  paymentMethod: string
): string {
  const itemsHtml = sale.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.product.name} x ${item.quantity}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">$${(item.product.sellingPrice * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('')

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
  <table>
    ${itemsHtml}
  </table>
  <div class="total">
    <span>Total:</span>
    <span>$${sale.total.toFixed(2)}</span>
  </div>
  <p style="text-align: center; margin-top: 10px;">Payment: ${paymentMethod.replace('_', ' ')}</p>
  <div class="footer">
    <p>Thank you for your purchase!</p>
  </div>
</body>
</html>
  `
}
