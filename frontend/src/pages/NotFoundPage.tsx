import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded border border-slate-200 bg-white p-6 text-center">
      <h1 className="mb-2 text-xl font-semibold">Page not found</h1>
      <Link to="/dashboard" className="text-sm text-blue-600">
        Back to dashboard
      </Link>
    </div>
  )
}
