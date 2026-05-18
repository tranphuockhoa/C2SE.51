import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange, className }) {
    if (totalPages <= 1) return null

    const getPages = () => {
        const pages = []
        const start = Math.max(1, page - 2)
        const end = Math.min(totalPages, page + 2)
        if (start > 1) {
            pages.push(1)
            if (start > 2) pages.push('...')
        }
        for (let i = start; i <= end; i++) pages.push(i)
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...')
            pages.push(totalPages)
        }
        return pages
    }

    return (
        <nav
            className={cn('flex items-center justify-center gap-1', className)}
            aria-label="Phân trang"
        >
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center justify-center size-9 rounded-lg text-text-light hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Trang trước"
            >
                <ChevronLeft className="size-4" />
            </button>

            {getPages().map((p, i) =>
                p === '...' ? (
                    <span
                        key={`dots-${i}`}
                        className="size-9 flex items-center justify-center text-text-muted text-sm"
                    >
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        className={cn(
                            'inline-flex items-center justify-center size-9 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                            p === page
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-text-light hover:bg-background'
                        )}
                        aria-current={p === page ? 'page' : undefined}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex items-center justify-center size-9 rounded-lg text-text-light hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Trang sau"
            >
                <ChevronRight className="size-4" />
            </button>
        </nav>
    )
}
