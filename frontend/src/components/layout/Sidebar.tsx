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
    <aside className="w-full border-b border-slate-200 bg-white p-3 md:w-56 md:border-b-0 md:border-r md:p-4">
      <div className="mb-2 hidden text-xs font-semibold uppercase tracking-wide text-slate-500 md:block">
        {role}
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-2 md:overflow-visible md:pb-0">
        {navByRole[role].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block whitespace-nowrap rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
