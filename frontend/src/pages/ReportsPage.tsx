import { useState } from 'react'
import { useSummary, useTopProducts, useExportSummaryCsv } from '../features/reports/hooks'
import { formatCurrency } from '../lib/utils/currency'

type Tab = 'summary' | 'top-products' | 'export'

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
  const { data: summary, isLoading: summaryLoading } = useSummary(period)
  const { data: topProducts, isLoading: topProductsLoading } = useTopProducts()
  const exportCsv = useExportSummaryCsv()

  const handleExport = async () => {
    try {
      const blob = await exportCsv.mutateAsync(period)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${period}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Reports</h1>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-slate-200">
        {(['summary', 'top-products', 'export'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'summary' ? 'Summary' : tab === 'top-products' ? 'Top Products' : 'Export'}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div>
          <div className="mb-4 flex gap-2">
            {(['day', 'week', 'month'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  period === value
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>

          {summaryLoading ? (
            <div className="py-12 text-center text-slate-500">Loading summary...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-sm text-slate-500">Total Revenue</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {formatCurrency(summary?.totalRevenue ?? 0)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-sm text-slate-500">Total Sales</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {summary?.totalSales ?? 0}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-sm text-slate-500">Average Sale Value</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {formatCurrency(summary?.averageSaleValue ?? 0)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-sm text-slate-500">Low Stock Items</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {summary?.lowStockCount ?? 0}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Products Tab */}
      {activeTab === 'top-products' && (
        <div>
          {topProductsLoading ? (
            <div className="py-12 text-center text-slate-500">Loading top products...</div>
          ) : topProducts && topProducts.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left">
                  <tr>
                    <th className="px-3 py-3 font-medium text-slate-700">#</th>
                    <th className="px-3 py-3 font-medium text-slate-700">Product</th>
                    <th className="px-3 py-3 font-medium text-slate-700">Quantity Sold</th>
                    <th className="px-3 py-3 font-medium text-slate-700">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={product.productId ?? index} className="border-t border-slate-100">
                      <td className="px-3 py-3 text-slate-600">{index + 1}</td>
                      <td className="px-3 py-3 text-slate-900">{product.name}</td>
                      <td className="px-3 py-3 text-slate-900">{product.quantitySold}</td>
                      <td className="px-3 py-3 text-slate-900">{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">No top products data available</div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Export Report Data</h3>
            <p className="mb-4 text-sm text-slate-600">
              Download your report data as a CSV file. Select a time period below.
            </p>
            <div className="mb-4 flex gap-2">
              {(['day', 'week', 'month'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPeriod(value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    period === value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={handleExport}
              disabled={exportCsv.isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {exportCsv.isPending ? 'Exporting...' : `Export ${period} Report as CSV`}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
