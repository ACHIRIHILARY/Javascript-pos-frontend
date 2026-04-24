import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks'
import type { Role } from '../../lib/types/auth'

type RoleGuardProps = {
  allowedRoles: Role[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/pos" replace />
  return <Outlet />
}
