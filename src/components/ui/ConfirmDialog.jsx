import { AlertTriangle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Reusable confirm dialog for delete/update actions.
 *
 * Usage:
 *   <ConfirmDialog
 *     isOpen={showDelete}
 *     onClose={() => setShowDelete(false)}
 *     onConfirm={handleDelete}
 *     title="Xóa đề thi"
 *     message="Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác."
 *     confirmText="Xóa"
 *     variant="danger"   // "danger" | "warning" | "info"
 *   />
 */
export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    loading = false,
}) {
    const overlayRef = useRef(null)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        const handler = e => e.key === 'Escape' && !busy && onClose?.()
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose, busy])

    useEffect(() => {
        if (!isOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleOverlayClick = e => {
        if (e.target === overlayRef.current && !busy) onClose?.()
    }

    const handleConfirm = async () => {
        setBusy(true)
        try {
            await onConfirm?.()
        } finally {
            setBusy(false)
        }
    }

    const isLoading = loading || busy

    const variantStyles = {
        danger: {
            icon: 'bg-red-100 text-red-600',
            button: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: 'bg-amber-100 text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700 text-white',
        },
        info: {
            icon: 'bg-primary/10 text-primary',
            button: 'bg-primary hover:bg-primary-dark text-white',
        },
    }

    const styles = variantStyles[variant] || variantStyles.danger

    return createPortal(
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
        >
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className={`shrink-0 flex items-center justify-center size-10 rounded-full ${styles.icon}`}
                        >
                            <AlertTriangle className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3
                                id="confirm-dialog-title"
                                className="text-base font-bold text-gray-900"
                            >
                                {title}
                            </h3>
                            <p
                                id="confirm-dialog-desc"
                                className="mt-1.5 text-sm text-gray-600 leading-relaxed"
                            >
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 ${styles.button}`}
                    >
                        {isLoading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}   