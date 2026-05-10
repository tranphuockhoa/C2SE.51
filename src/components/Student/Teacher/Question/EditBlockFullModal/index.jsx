import { questionBlockService } from '@/services/QuestionBlockService'
import { Layers, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import BlockBuilder from '../BlockBuilder'

/**
 * EditBlockModal — full-screen Claymorphism overlay wrapping BlockBuilder for editing.
 * Loads existing block data and passes to BlockBuilder in edit mode.
 */
export default function EditBlockModal({ isOpen, onClose, blockId, onSuccess }) {
    const [animateIn, setAnimateIn] = useState(false)
    const [loading, setLoading] = useState(false)
    const [blockData, setBlockData] = useState(null)

    const loadBlockData = useCallback(async () => {
        if (!blockId) return

        setLoading(true)
        try {
            const response = await questionBlockService.getBlockById(blockId)
            if (response.success) {
                setBlockData(response.data.block)
            }
        } catch (error) {
            console.error('Failed to load block:', error)
            alert('Không thể tải dữ liệu nhóm câu hỏi!')
            onClose?.()
        } finally {
            setLoading(false)
        }
    }, [blockId, onClose])

    // Load block data when modal opens
    useEffect(() => {
        if (isOpen && blockId) {
            loadBlockData()
        } else {
            setBlockData(null)
        }
    }, [isOpen, blockId, loadBlockData])

    const handleSuccess = () => {
        onSuccess?.()
        onClose?.()
    }

    /* lock body scroll */
    useEffect(() => {
        if (!isOpen) return
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    /* Animate in */
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setAnimateIn(true))
        } else {
            setAnimateIn(false)
        }
    }, [isOpen])

    /* ESC key */
    useEffect(() => {
        if (!isOpen) return
        const handler = e => e.key === 'Escape' && onClose?.()
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6 bg-black/30"
            onClick={e => e.target === e.currentTarget && onClose?.()}
        >
            <div className="relative my-4 w-full max-w-5xl rounded-2xl border border-gray-200 bg-[#F8FAFC] shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-[#E2E8F0] bg-white/80 px-5 py-3.5 rounded-t-2xl">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-[#2563EB]/10">
                            <Layers className="size-4 text-[#2563EB]" />
                        </div>
                        <h2
                            className="text-base font-bold text-[#1E293B]"
                            style={{ fontFamily: "'Noto Serif JP', serif" }}
                        >
                            Chỉnh sửa nhóm câu hỏi
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#475569] cursor-pointer"
                        aria-label="Đóng"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                                <p className="mt-3 text-sm text-gray-500">Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    )}

                    {!loading && blockData && (
                        <BlockBuilder
                            editMode={true}
                            initialData={blockData}
                            onSuccess={handleSuccess}
                            onCancel={onClose}
                        />
                    )}

                    {!loading && !blockData && (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-sm text-gray-500">
                                Không tìm thấy dữ liệu nhóm câu hỏi
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}