import { NavLink, useNavigate } from 'react-router-dom'
import { logout, getClinic, getUser } from '../lib/auth'
import { Calendar, Users, Package, LayoutDashboard, Settings, LogOut } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'ภาพรวม' },
  { to: '/appointments', icon: Calendar, label: 'นัดหมาย' },
  { to: '/patients', icon: Users, label: 'คนไข้' },
  { to: '/packages', icon: Package, label: 'คอร์ส/แพ็กเกจ' },
  { to: '/settings', icon: Settings, label: 'ตั้งค่า' },
]

export default function Layout({ children }) {
  const nav = useNavigate()
  const clinic = getClinic()
  const user = getUser()

  function handleLogout() {
    logout()
    nav('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-lg font-semibold text-pink-500">🌸 ClinicOS</p>
          <p className="text-xs text-gray-400 truncate">{clinic?.name}</p>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-pink-50 text-pink-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition"
          >
            <LogOut size={12} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
