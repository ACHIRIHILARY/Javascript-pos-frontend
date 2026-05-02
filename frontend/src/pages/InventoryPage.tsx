import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProducts, useCategories, useCreateProduct, useDeleteProduct, useAdjustProductStock, useCreateCategory } from '../features/products/hooks'
import { formatCurrency } from '../lib/utils/currency'
import { mapApiError } from '../lib/api/error'
import type { Product, Category } from '../lib/types/domain'

export function InventoryPage() {
  const navigate = useNavigate()
  const { data: products, isLoading } = useProducts()
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const deleteProduct = useDeleteProduct()
  const adjustStock = useAdjustProductStock()
  const createCategory = useCreateCategory()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState(0)
  const [adjustReason, setAdjustReason] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')

  // Form state for create product
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    categoryId: '',
    sellingPrice: '',
    stock: '',
    lowStockThreshold: '10',
  })
  const [createProductError, setCreateProductError] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter((product) => {
      const matchesSearch = !search || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || product.categoryId === categoryFilter
      const matchesLowStock = !lowStockOnly || product.stock <= product.lowStockThreshold
      return matchesSearch && matchesCategory && matchesLowStock
    })
  }, [products, search, categoryFilter, lowStockOnly])

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.categoryId || !formData.sellingPrice) return
    setCreateProductError(null)
    try {
      await createProduct.mutateAsync({
        name: formData.name,
        barcode: formData.barcode || undefined,
        categoryId: formData.categoryId,
        sellingPrice: Number(formData.sellingPrice),
        stock: Number(formData.stock) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 10,
      })
      setShowCreateModal(false)
      setFormData({ name: '', barcode: '', categoryId: '', sellingPrice: '', stock: '', lowStockThreshold: '10' })
    } catch (error) {
      const errorMessage = mapApiError(error)
      setCreateProductError(errorMessage)
      console.error('Failed to create product:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await deleteProduct.mutateAsync(id)
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleAdjustStock = async () => {
    if (!selectedProduct || adjustQuantity === 0) return
    try {
      await adjustStock.mutateAsync({
        id: selectedProduct.id,
        payload: { quantity: adjustQuantity, reason: adjustReason },
      })
      setShowAdjustModal(false)
      setSelectedProduct(null)
      setAdjustQuantity(0)
      setAdjustReason('')
    } catch (error) {
      console.error('Failed to adjust stock:', error)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await createCategory.mutateAsync(newCategoryName)
      setNewCategoryName('')
      setShowCategoryModal(false)
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const openAdjustModal = (product: Product) => {
    setSelectedProduct(product)
    setAdjustQuantity(0)
    setAdjustReason('')
    setShowAdjustModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-slate-500">Loading inventory...</div>
      </div>
    )
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Add Category
          </button>
          <button
            onClick={() => {
              setShowCreateModal(true)
              setCreateProductError(null)
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 whitespace-nowrap">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Low stock only</span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-3 font-medium text-slate-700">Name</th>
              <th className="px-3 py-3 font-medium text-slate-700">Barcode</th>
              <th className="px-3 py-3 font-medium text-slate-700">Category</th>
              <th className="px-3 py-3 font-medium text-slate-700">Price</th>
              <th className="px-3 py-3 font-medium text-slate-700">Stock</th>
              <th className="px-3 py-3 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  {search || categoryFilter || lowStockOnly ? 'No products match your filters' : 'No products found'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-3 py-3">
                    <Link
                      to={`/dashboard/inventory/${product.id}`}
                      className="text-slate-900 hover:text-slate-700 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{product.barcode || '-'}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {typeof product.category === 'object' ? product.category?.name : '-'}
                  </td>
                  <td className="px-3 py-3 text-slate-900">{formatCurrency(product.sellingPrice)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-700'
                          : product.stock <= product.lowStockThreshold
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAdjustModal(product)}
                        className="text-xs text-slate-600 hover:text-slate-900"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Add Product</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Barcode</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Low Stock Threshold</label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
              {createProductError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{createProductError}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateProductError(null)
                }}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={createProduct.isPending || !formData.name || !formData.categoryId || !formData.sellingPrice}
                className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {createProduct.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Adjust Stock</h2>
            <p className="mb-4 text-sm text-slate-600">
              Product: <strong>{selectedProduct.name}</strong><br />
              Current stock: <strong>{selectedProduct.stock}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Quantity (+/-)</label>
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

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Add Category</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={createCategory.isPending || !newCategoryName.trim()}
                className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {createCategory.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
