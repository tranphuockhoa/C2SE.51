import Button from '@/components/ui/Button'
import useAuthStore from '@/stores/authStore'
import {
    Bookmark,
    ChevronDown,
    Lightbulb,
    LogOut,
    Menu,
    RefreshCw,
    Trophy,
    User,
    X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const navLinks = [{ path: '/', label: 'Trang chủ', end: true }]

const authNavLinks = [
    { path: '/leaderboard', label: 'Xếp hạng', icon: Trophy },
    { path: '/wrong-questions', label: 'Câu sai', icon: RefreshCw },
    { path: '/bookmarks', label: 'Đã lưu', icon: Bookmark },
    { path: '/recommendations', label: 'Gợi ý', icon: Lightbulb },
]

export default function StudentHeader() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const { isAuthenticated, user, logout } = useAuthStore()
    const navigate = useNavigate()
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
        <header className="bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="size-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                            J
                        </div>
                        <span className="text-xl font-bold text-text">JLPT Insight</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.end}
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'text-primary bg-primary/5'
                                            : 'text-text-light hover:text-text hover:bg-background'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        {isAuthenticated &&
                            authNavLinks.map(link => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'text-primary bg-primary/5'
                                                : 'text-text-light hover:text-text hover:bg-background'
                                        }`
                                    }
                                >
                                    <link.icon className="size-3.5" />
                                    {link.label}
                                </NavLink>
                            ))}
                    </nav>

                    {/* Right section */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
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
                                    <span className="text-sm font-medium text-text hidden sm:block">
                                        {user?.fullName}
                                    </span>
                                    <ChevronDown className="size-4 text-text-muted" />
                                </button>
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-border shadow-lg z-50 py-1">
                                        <div className="px-4 py-2 border-b border-border-light">
                                            <p className="text-sm font-medium text-text">
                                                {user?.fullName}
                                            </p>
                                            <p className="text-xs text-text-muted">{user?.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text hover:bg-background transition-colors"
                                        >
                                            <User className="size-4" />
                                            Trang cá nhân
                                        </Link>
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
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Đăng ký</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile toggle */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer"
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-border py-3 space-y-1">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.end}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'text-primary bg-primary/5'
                                            : 'text-text-light hover:bg-background'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        {isAuthenticated &&
                            authNavLinks.map(link => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'text-primary bg-primary/5'
                                                : 'text-text-light hover:bg-background'
                                        }`
                                    }
                                >
                                    <link.icon className="size-4" />
                                    {link.label}
                                </NavLink>
                            ))}
                        {!isAuthenticated && (
                            <div className="flex gap-2 pt-2 px-4">
                                <Link to="/login" className="flex-1">
                                    <Button variant="secondary" size="sm" className="w-full">
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link to="/register" className="flex-1">
                                    <Button size="sm" className="w-full">
                                        Đăng ký
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}