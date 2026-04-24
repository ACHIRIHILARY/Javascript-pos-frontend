import { useAuth } from '../../features/auth/hooks'
import { APP_NAME } from '../../lib/constants'

export function Topbar() {
  const { user, logout } = useAuth()
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <strong>{APP_NAME}</strong>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">{user?.name}</span>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded bg-slate-900 px-3 py-1 text-xs text-white"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
