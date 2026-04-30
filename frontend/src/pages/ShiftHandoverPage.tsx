import { useState } from 'react'
import { useAuth } from '../features/auth/hooks'
import { useShiftReport, useEndShift } from '../features/shifts/hooks'
import { useUsers } from '../features/users/hooks'
import { formatCurrency } from '../lib/utils/currency'

type Tab = 'end-shift' | 'report'

export function ShiftHandoverPage() {
  const { user } = useAuth()
  const isOwnerOrAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN'
  
  const [activeTab, setActiveTab] = useState<Tab>(isOwnerOrAdmin ? 'report' : 'end-shift')
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedCashierId, setSelectedCashierId] = useState('')

  const { data: users } = useUsers()
  const { data: shiftReport, isLoading: reportLoading } = useShiftReport(
    isOwnerOrAdmin ? { from: fromDate, to: toDate } : {}
  )
  const endShift = useEndShift()

  const handleEndShift = async () => {
    try {
      await endShift.mutateAsync({
        cashierId: selectedCashierId || undefined,
        from: fromDate,
        to: toDate,
      })
      alert('Shift ended successfully!')
    } catch (error) {
      console.error('Failed to end shift:', error)
    }
  }

  // Filter shifts by cashier if selected
  const filteredShifts = shiftReport?.filter((shift) => 
    !selectedCashierId || shift.cashierId === selectedCashierId
  ) ?? []

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Shifts</h1>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('end-shift')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'end-shift'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          End Shift
        </button>
        {isOwnerOrAdmin && (
          <button
            onClick={() => setActiveTab('report')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'report'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Shift Report
          </button>
        )}
      </div>

      {/* End Shift Tab */}
      {activeTab === 'end-shift' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">End Your Shift</h2>
          <p className="mb-4 text-sm text-slate-600">
            Complete your shift and view the summary of your transactions.
          </p>
          
          {isOwnerOrAdmin && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Select Cashier (optional)
              </label>
              <select
                value={selectedCashierId}
                onChange={(e) => setSelectedCashierId(e.target.value)}
                className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="">Current User</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4 flex gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleEndShift}
            disabled={endShift.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {endShift.isPending ? 'Processing...' : 'End Shift'}
          </button>
        </div>
      )}

      {/* Report Tab (OWNER/ADMIN only) */}
      {activeTab === 'report' && isOwnerOrAdmin && (
        <div>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Filter by Cashier</label>
              <select
                value={selectedCashierId}
                onChange={(e) => setSelectedCashierId(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="">All Cashiers</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Report Table */}
          {reportLoading ? (
            <div className="py-12 text-center text-slate-500">Loading shift report...</div>
          ) : filteredShifts.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-left">
                  <tr>
                    <th className="px-3 py-3 font-medium text-slate-700">Cashier</th>
                    <th className="px-3 py-3 font-medium text-slate-700">Transactions</th>
                    <th className="px-3 py-3 font-medium text-slate-700">Total Sales</th>
                    <th className="px-3 py-3 font-medium text-slate-700">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShifts.map((shift, index) => {
                    const cashier = users?.find((u) => u.id === shift.cashierId)
                    return (
                      <tr key={shift.cashierId || index} className="border-t border-slate-100">
                        <td className="px-3 py-3 text-slate-900">
                          {shift.cashierName || cashier?.name || shift.cashierId || 'Unknown'}
                        </td>
                        <td className="px-3 py-3 text-slate-900">{shift.transactionCount}</td>
                        <td className="px-3 py-3 text-slate-900">{shift.totalSales}</td>
                        <td className="px-3 py-3 text-slate-900 font-medium">
                          {formatCurrency(shift.totalRevenue)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="px-3 py-3 font-medium text-slate-900">Total</td>
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {filteredShifts.reduce((sum, s) => sum + s.transactionCount, 0)}
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {filteredShifts.reduce((sum, s) => sum + s.totalSales, 0)}
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {formatCurrency(filteredShifts.reduce((sum, s) => sum + s.totalRevenue, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              No shift data found for the selected period
            </div>
          )}
        </div>
      )}
    </section>
  )
}
