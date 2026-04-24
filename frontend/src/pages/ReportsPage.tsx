import { useState } from 'react'
import { useSummary } from '../features/reports/hooks'
import { formatCurrency } from '../lib/utils/currency'

export function ReportsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
  const { data } = useSummary(period)
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Reports</h1>
      <div className="mb-4 flex gap-2">
        {(['day', 'week', 'month'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setPeriod(value)}
            className={`rounded px-3 py-1 text-sm ${period === value ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="rounded border border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-500">Revenue ({period})</div>
        <div className="text-lg font-semibold">{formatCurrency(data?.totalRevenue ?? 0)}</div>
      </div>
    </section>
  )
}
