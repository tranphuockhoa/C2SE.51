import { cn } from '@/lib/utils'
import { questionBlockService } from '@/services/QuestionBlockService'
import { AlertCircle, BookOpen, Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SECTION_OPTIONS = [
    { value: 'vocabulary', label: 'Từ vựng' },
    { value: 'grammar', label: 'Ngữ pháp' },
    { value: 'reading', label: 'Đọc hiểu' },
    { value: 'listening', label: 'Nghe' },
]

const LEVEL_OPTIONS = [
    { value: 'N5', label: 'N5' },
    { value: 'N4', label: 'N4' },
    { value: 'N3', label: 'N3' },
    { value: 'N2', label: 'N2' },
    { value: 'N1', label: 'N1' },
]

const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' },
]

/**
 * Modal chỉnh sửa thông tin Block (metadata + context)
 */
export default function EditBlockModal({ isOpen, onClose, blockData, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [animateIn, setAnimateIn] = useState(false)
    const [errors, setErrors] = useState({})
    const overlayRef = useRef(null)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        section: 'vocabulary',
        level: 'N5',
        difficulty: 'medium',
        instructions: '',
        tags: '',
        context: {
            text: '',
            audioScript: '',
        },
    })

    // Initialize form data from blockData
    useEffect(() => {
        if (blockData && isOpen) {
            setFormData({
                title: blockData.title || '',
                section: blockData.section || 'vocabulary',
                level: blockData.level || 'N5',
                difficulty: blockData.difficulty || 'medium',
                instructions: blockData.instructions || '',
                tags: blockData.tags?.join(', ') || '',
                context: {
                    text: blockData.context?.text || '',
                    audioScript: blockData.context?.audioScript || '',
                },
            })
        }
    }, [blockData, isOpen])

    // Lock body scroll
    useEffect(() => {
        if (!isOpen) return
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleClose = useCallback(() => {
        if (loading) return
        onClose()
    }, [loading, onClose])

    // Animate in
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setAnimateIn(true))
        } else {
            setAnimateIn(false)
            setErrors({})
        }
    }, [isOpen])

    // ESC key
    useEffect(() => {
        if (!isOpen) return
        const handler = e => e.key === 'Escape' && handleClose()
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, handleClose])

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return
        const handler = e => {
            if (overlayRef.current === e.target) {
                handleClose()
            }
        }
        window.addEventListener('click', handler)
        return () => window.removeEventListener('click', handler)
    }, [isOpen, handleClose])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }))
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleContextChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            context: {
                ...prev.context,
                [field]: value,
            },
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title?.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async e => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            const updatePayload = {
                blockId: blockData._id,
                title: formData.title.trim(),
                section: formData.section,
                level: formData.level,
                difficulty: formData.difficulty,
                instructions: formData.instructions.trim() || undefined,
                tags: formData.tags
                    ? formData.tags
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag)
                    : undefined,
                context: {
                    ...(blockData.context || {}),
                    text: formData.context.text.trim() || undefined,
                    audioScript: formData.context.audioScript.trim() || undefined,
                },
            }

            await questionBlockService.updateBlock(updatePayload)
            onSuccess?.()
            handleClose()
        } catch (error) {
            console.error('Failed to update block:', error)
            alert('Có lỗi xảy ra khi cập nhật nhóm câu hỏi!')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return createPortal(
        <div
            ref={overlayRef}
            className={cn(
                'fixed inset-0 z-50 flex items-center justify-center p-4 transition-[background-color] duration-200',
                animateIn ? 'bg-black/30' : 'bg-transparent'
            )}
        >
            <div
                className={cn(
                    'relative w-full max-w-2xl rounded-2xl border-[3px] border-white/70 bg-[#F8FAFC] transition-[opacity,transform] duration-200 will-change-[opacity,transform]',
                    animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                )}
                style={{
                    boxShadow:
                        '8px 8px 24px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.6), inset 0 2px 0 rgba(255,255,255,0.5)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-[#E2E8F0] bg-white/80 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-[#2563EB]/10">
                            <BookOpen className="size-4 text-[#2563EB]" />
                        </div>
                        <h2 className="text-lg font-bold text-[#1E293B]">Chỉnh sửa nhóm câu hỏi</h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="rounded-xl p-2 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#475569] disabled:pointer-events-none cursor-pointer"
                        aria-label="Đóng"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-[#374151] mb-2">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => handleInputChange('title', e.target.value)}
                            className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#2563EB] focus:outline-none"
                            placeholder="Nhập tiêu đề cho nhóm câu hỏi..."
                        />
                        {errors['title'] && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="size-3" />
                                {errors['title']}
                            </div>
                        )}
                    </div>

                    {/* Row 1: Section, Level, Difficulty */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-2">
                                Phần thi
                            </label>
                            <select
                                value={formData.section}
                                onChange={e => handleInputChange('section', e.target.value)}
                                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#2563EB] focus:outline-none"
                            >
                                {SECTION_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-2">
                                Cấp độ
                            </label>
                            <select
                                value={formData.level}
                                onChange={e => handleInputChange('level', e.target.value)}
                                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#2563EB] focus:outline-none"
                            >
                                {LEVEL_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-2">
                                Độ khó
                            </label>
                            <select
                                value={formData.difficulty}
                                onChange={e => handleInputChange('difficulty', e.target.value)}
                                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#2563EB] focus:outline-none"
                            >
                                {DIFFICULTY_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className="block text-sm font-semibold text-[#374151] mb-2">
                            Hướng dẫn
                        </label>
                        <textarea
                            value={formData.instructions}
                            onChange={e => handleInputChange('instructions', e.target.value)}
                            className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#2563EB] focus:outline-none resize-none"
                            placeholder="Hướng dẫn làm bài (tùy chọn)..."
                            rows={2}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-[#374151] mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={e => handleInputChange('tags', e.target.value)}
                            className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#2563EB] focus:outline-none"
                            placeholder="Phân cách bằng dấu phẩy..."
                        />
                    </div>

                    {/* Context */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#374151]">Context chung</h3>

                        <div>
                            <label className="block text-sm font-medium text-[#6B7280] mb-2">
                                Nội dung context
                            </label>
                            <textarea
                                value={formData.context.text}
                                onChange={e => handleContextChange('text', e.target.value)}
                                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#2563EB] focus:outline-none resize-none"
                                placeholder="Đoạn văn, từ vựng chung..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#6B7280] mb-2">
                                Script audio
                            </label>
                            <textarea
                                value={formData.context.audioScript}
                                onChange={e => handleContextChange('audioScript', e.target.value)}
                                className="w-full rounded-xl border-2 border-[#E5E7EB] bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#2563EB] focus:outline-none resize-none"
                                placeholder="Nội dung audio script..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl border-2 border-[#E5E7EB] bg-white text-sm font-semibold text-[#6B7280] hover:bg-[#F9FAFB] transition-colors disabled:pointer-events-none cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-[#2563EB] bg-[#2563EB] text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        >
                            {loading && <Loader2 className="size-4 animate-spin" />}
                            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
}