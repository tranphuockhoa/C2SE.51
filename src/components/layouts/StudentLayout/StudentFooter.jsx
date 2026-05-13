import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = [
    { path: '/', label: 'Trang chủ' },
    { path: '/leaderboard', label: 'Xếp hạng' },
    { path: '/recommendations', label: 'Gợi ý bài thi' },
]

export default function StudentFooter() {
    return (
        <footer className="bg-white border-t border-border">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2.5 mb-4">
                            <div className="size-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                                J
                            </div>
                            <span className="text-xl font-bold text-text">JLPT Insight</span>
                        </Link>
                        <p className="text-sm text-text-light leading-relaxed">
                            Nền tảng luyện thi JLPT trực tuyến hàng đầu với đề thi chất lượng cao từ
                            N5 đến N1.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-text mb-4">Liên kết</h4>
                        <ul className="space-y-2">
                            {footerLinks.map(link => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-text-light hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-text mb-4">Liên hệ</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-text-light">
                                <MapPin className="size-4 mt-0.5 shrink-0 text-primary" />
                                <span>Hà Nội, Việt Nam</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-text-light">
                                <Phone className="size-4 shrink-0 text-primary" />
                                <span>0247.101.9868</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-text-light">
                                <Mail className="size-4 shrink-0 text-primary" />
                                <span>lienhe@jlptinsight.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-border">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-text-muted">
                        © {new Date().getFullYear()} JLPT Insight. All rights reserved.
                    </p>
                    <p className="text-xs text-text-muted">日本語能力試験対策</p>
                </div>
            </div>
        </footer>
    )
}