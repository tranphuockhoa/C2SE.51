import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authService } from '@/services/AuthService'
import useAuthStore from '@/stores/authStore'
import { toast } from '@/utils/toast'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const login = useAuthStore(s => s.login)
    const navigate = useNavigate()

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }
        if (form.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        setLoading(true)
        try {
            const { data } = await authService.register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
            })
            login(data.data.user, data.data.token)
            toast.success('Đăng ký thành công!')
            navigate('/', { replace: true })
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-white to-secondary/10 px-4">
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
                    <p className="text-text-light mt-2">Tạo tài khoản để bắt đầu luyện thi</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-border-light shadow-lg p-8">
                    <h2 className="text-xl font-bold text-text mb-1">Đăng ký</h2>
                    <p className="text-sm text-text-muted mb-6">
                        Điền thông tin để tạo tài khoản mới
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-lg bg-destructive-light border border-red-200 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Họ và tên"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            required
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />

                        <Input
                            label="Mật khẩu"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Tối thiểu 6 ký tự"
                            required
                        />

                        <Input
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu"
                            required
                        />

                        <Button type="submit" loading={loading} className="w-full">
                            Đăng ký
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-text-light">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}