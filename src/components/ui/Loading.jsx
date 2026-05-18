import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ size = 'md', className = '' }) {
    const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-8' }
    return <Loader2 className={cn('animate-spin text-primary', sizes[size], className)} />
}

export function LoadingPage({ message = 'Đang tải dữ liệu...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-text-light text-sm">{message}</p>
        </div>
    )
}

export function LoadingOverlay({ message = 'Đang xử lý...' }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl px-8 py-6 flex flex-col items-center gap-3">
                <LoadingSpinner size="lg" />
                <p className="text-text font-medium text-sm">{message}</p>
            </div>
        </div>
    )
}
