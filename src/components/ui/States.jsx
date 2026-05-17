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