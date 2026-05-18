import { AlertTriangle, Inbox, RefreshCw, SearchX } from 'lucide-react'
import Button from './Button'

export function ErrorState({
    title = 'Đã xảy ra lỗi',
    message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
    onRetry = null,
    action = null,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="size-14 rounded-full bg-destructive-light flex items-center justify-center">
                <AlertTriangle className="size-7 text-destructive" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-text">{title}</h3>
                <p className="text-sm text-text-light mt-1 max-w-sm">{message}</p>
            </div>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    <RefreshCw className="size-4" />
                    Thử lại
                </Button>
            )}
            {action}
        </div>
    )
}

export function EmptyState({
    icon: Icon = Inbox,
    title = 'Không có dữ liệu',
    message = '',
    action = null,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="size-14 rounded-full bg-background flex items-center justify-center">
                <Icon className="size-7 text-text-muted" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-text">{title}</h3>
                {message && <p className="text-sm text-text-light mt-1 max-w-sm">{message}</p>}
            </div>
            {action}
        </div>
    )
}

export function NotFoundState({
    title = 'Không tìm thấy kết quả',
    message = 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.',
    actionLabel = '',
    onAction = null,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="size-14 rounded-full bg-warning-light flex items-center justify-center">
                <SearchX className="size-7 text-warning" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-text">{title}</h3>
                <p className="text-sm text-text-light mt-1 max-w-sm">{message}</p>
            </div>
            {actionLabel && onAction && (
                <Button variant="secondary" size="sm" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
