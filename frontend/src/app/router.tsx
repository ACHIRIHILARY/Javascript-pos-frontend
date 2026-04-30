import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks'
import { ProtectedRoute } from '../components/guards/ProtectedRoute'
import { RoleGuard } from '../components/guards/RoleGuard'
import { AppShell } from '../components/layout/AppShell'
import { DashboardPage } from '../pages/DashboardPage'
import { InventoryPage } from '../pages/InventoryPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { POSPage } from '../pages/POSPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { ReportsPage } from '../pages/ReportsPage'
import { SaleDetailPage } from '../pages/SaleDetailPage'
import { SalesPage } from '../pages/SalesPage'
import { ShiftHandoverPage } from '../pages/ShiftHandoverPage'
import { UsersPage } from '../pages/UsersPage'
function RoleHomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'CASHIER' ? '/pos' : '/dashboard'} replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<RoleHomeRedirect />} />
            <Route path="/pos" element={<POSPage />} />
            <Route element={<RoleGuard allowedRoles={['OWNER', 'ADMIN']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/inventory" element={<InventoryPage />} />
              <Route path="/dashboard/inventory/:id" element={<ProductDetailPage />} />
              <Route path="/dashboard/reports" element={<ReportsPage />} />
              <Route path="/dashboard/users" element={<UsersPage />} />
            </Route>
            <Route element={<RoleGuard allowedRoles={['OWNER', 'ADMIN', 'CASHIER']} />}>
              <Route path="/dashboard/sales" element={<SalesPage />} />
              <Route path="/dashboard/sales/:id" element={<SaleDetailPage />} />
              <Route path="/dashboard/shifts" element={<ShiftHandoverPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
