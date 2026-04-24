import { useShiftReport } from '../features/shifts/hooks'

export function ShiftHandoverPage() {
  const { data, isLoading } = useShiftReport()
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Shifts</h1>
      <div className="rounded border border-slate-200 bg-white p-4">
        {isLoading
          ? 'Loading...'
          : data?.map((row) => (
              <div key={row.cashierId} className="py-2 text-sm">
                {row.cashierId}: {row.totalSales}
              </div>
            ))}
      </div>
    </section>
  )
}
