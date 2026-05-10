import useAuthStore from '@/stores/authStore'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

/**
 * Shared dashboard layout for Creator & Admin.
 * @param {object} props
 * @param {string} props.title - e.g. "Người tạo đề" or "Quản trị"
 * @param {string} props.basePath - e.g. "/creator" or "/admin"
 * @param {Array} props.menuItems - sidebar nav items
 * @param {React.ReactNode} props.children - <Outlet />
 */
export default function DashboardLayout({ title, basePath, menuItems, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const userMenuRef = useRef(null)

    useEffect(() => {
        const handleClick = e => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* ── Header ── */}
            <header className="bg-white border-b border-border shadow-sm z-20 shrink-0">
                <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
                    {/* Left: Logo + Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer"
                            aria-label="Mở menu"
                        >
                            {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                        <Link to={basePath} className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
                                J
                            </div>
                            <span className="text-lg font-bold text-text hidden sm:block">
                                JLPT Insight
                            </span>
                        </Link>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full hidden sm:block">
                            {title}
                        </span>
                    </div>

                    {/* Right: User menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            type="button"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer"
                        >
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                    {user?.fullName?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-medium text-text leading-tight">
                                    {user?.fullName || 'Người dùng'}
                                </p>
                                <p className="text-xs text-text-muted leading-tight">
                                    {user?.email}
                                </p>
                            </div>
                            <ChevronDown className="size-4 text-text-muted" />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-border shadow-lg z-50 py-1">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive-light transition-colors cursor-pointer"
                                >
                                    <LogOut className="size-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* ── Sidebar ── */}
                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <aside
                    className={`
                        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-border
                        transform transition-transform duration-200 ease-in-out
                        lg:transform-none lg:translate-x-0 flex flex-col pt-14 lg:pt-0
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {menuItems.map(item => {
                            if (item.children) {
                                return <SidebarGroup key={item.id} item={item} />
                            }
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    end={item.path === basePath}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                            isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-light hover:bg-background hover:text-text'
                                        }`
                                    }
                                >
                                    {item.icon && <item.icon className="size-5 shrink-0" />}
                                    <span>{item.label}</span>
                                </NavLink>
                            )
                        })}
                    </nav>
                </aside>

                {/* ── Main Content ── */}
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    )
}

function SidebarGroup({ item }) {
    const [open, setOpen] = useState(true)
    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-light hover:bg-background transition-colors cursor-pointer"
            >
                {item.icon && <item.icon className="size-5 shrink-0" />}
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown
                    className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div className="ml-4 pl-4 border-l border-border-light space-y-0.5 mt-0.5">
                    {item.children.map(child => (
                        <NavLink
                            key={child.id}
                            to={child.path}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                                    isActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-text-light hover:bg-background hover:text-text'
                                }`
                            }
                        >
                            {child.icon && <child.icon className="size-4 shrink-0" />}
                            <span>{child.label}</span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    )
}