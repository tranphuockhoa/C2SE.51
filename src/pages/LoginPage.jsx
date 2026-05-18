import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authService } from '@/services/AuthService'
import useAuthStore from '@/stores/authStore'
import { toast } from '@/utils/toast'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const login = useAuthStore(s => s.login)
    const navigate = useNavigate()

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { data } = await authService.login({ email, password })
            login(data.data.user, data.data.token)
            toast.success('Đăng nhập thành công!')
            const role = data.data.user?.role
            if (role === 'admin') navigate('/admin', { replace: true })
            else if (role === 'creator') navigate('/creator', { replace: true })
            else navigate('/', { replace: true })
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-white to-secondary/10 px-4">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 size-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 size-40 bg-cta/5 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-md">
                            J
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-text">JLPT Insight</h1>
                    <p className="text-text-light mt-2">Nền tảng luyện thi JLPT trực tuyến</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-border-light shadow-lg p-8">
                    <h2 className="text-xl font-bold text-text mb-1">Đăng nhập</h2>
                    <p className="text-sm text-text-muted mb-6">Nhập thông tin để tiếp tục</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-lg bg-destructive-light border border-red-200 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email"
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />

                        <Input
                            label="Mật khẩu"
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />

                        <Button type="submit" loading={loading} className="w-full">
                            Đăng nhập
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-text-light">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}