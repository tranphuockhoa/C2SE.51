import { Layers, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import BlockBuilder from '../BlockBuilder'

/**
 * AddQuestion — full-screen Claymorphism overlay wrapping BlockBuilder.
 * Zero shadcn — uses createPortal + native HTML.
 */
export default function AddQuestion({ isOpen, onClose, onSubmit }) {
    const [animateIn, setAnimateIn] = useState(false)

    const handleSuccess = () => {
        onSubmit?.()
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
                            Tạo câu hỏi mới
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
                    <BlockBuilder onSuccess={handleSuccess} onCancel={onClose} />
                </div>
            </div>
        </div>,
        document.body
    )
}