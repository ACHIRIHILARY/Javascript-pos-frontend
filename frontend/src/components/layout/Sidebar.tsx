import { NavLink } from 'react-router-dom'
import type { Role } from '../../lib/types/auth'

type SidebarProps = {
  role: Role
}

const navByRole: Record<Role, { to: string; label: string }[]> = {
  OWNER: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/dashboard/inventory', label: 'Inventory' },
    { to: '/dashboard/sales', label: 'Sales' },
    { to: '/dashboard/reports', label: 'Reports' },
    { to: '/dashboard/users', label: 'Users' },
    { to: '/dashboard/shifts', label: 'Shifts' },
    { to: '/pos', label: 'POS' },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/dashboard/inventory', label: 'Inventory' },
    { to: '/dashboard/sales', label: 'Sales' },
    { to: '/dashboard/reports', label: 'Reports' },
    { to: '/dashboard/users', label: 'Users' },
    { to: '/dashboard/shifts', label: 'Shifts' },
    { to: '/pos', label: 'POS' },
  ],
  CASHIER: [
    { to: '/pos', label: 'POS' },
    { to: '/dashboard/sales', label: 'Sales' },
    { to: '/dashboard/shifts', label: 'Shifts' },
  ],
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="w-56 border-r border-slate-200 bg-white p-4">
      <nav className="space-y-2">
        {navByRole[role].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
