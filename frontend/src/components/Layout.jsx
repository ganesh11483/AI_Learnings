import { Outlet, Link, useLocation, useState } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  Activity,
  BarChart3,
  Bot,
  DollarSign,
  Shield,
  Clock,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [dashboardExpanded, setDashboardExpanded] = useState(false)

  const navigation = [
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Claims', href: '/claims', icon: Receipt },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Audit Logs', href: '/audit', icon: Activity },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ]

  const dashboardSubmenu = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Claims Metrics', href: '/metrics/claims-processing', icon: BarChart3 },
    { name: 'AI Automation', href: '/metrics/ai-automation', icon: Bot },
    { name: 'Revenue & Financial', href: '/metrics/revenue-financial', icon: DollarSign },
    { name: 'Compliance & Audit', href: '/metrics/compliance-audit', icon: Shield },
    { name: 'Operational Efficiency', href: '/metrics/operational-efficiency', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-6 border-b border-primary-700">
          <h1 className="text-xl font-bold">MedCoding AI</h1>
          <p className="text-xs text-primary-300 mt-1">Claims Automation System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {/* Dashboard Submenu */}
          <div className="mb-4">
            <button
              onClick={() => setDashboardExpanded(!dashboardExpanded)}
              className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                dashboardExpanded || dashboardSubmenu.some(item => location.pathname === item.href)
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-100 hover:bg-primary-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">Dashboard</span>
              {dashboardExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {dashboardExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {dashboardSubmenu.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-primary-100 hover:bg-primary-800'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Other Navigation Items */}
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-100 hover:bg-primary-800'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-primary-300 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-primary-100 hover:bg-primary-800 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {dashboardSubmenu.find(item => item.href === location.pathname)?.name || 
             navigation.find(item => item.href === location.pathname)?.name || 
             'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <img
              src="https://companieslogo.com/img/orig/CAP.PA_BIG-cbc06f01.png?t=1720244491&download=true"
              alt="Capgemini logo"
              className="h-10 object-contain"
            />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
