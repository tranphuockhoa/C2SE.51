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
}