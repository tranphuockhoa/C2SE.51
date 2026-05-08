import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { examService } from '@/services'
import { Loader2, PencilLine, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

/**
 * Modal chỉnh sửa thông tin đề thi (metadata)
 * - title, description, level, duration, passingScore, instructions, isPublic
 */
export default function EditExamMetadataModal({ isOpen, onClose, exam, onSuccess }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        level: 'N5',
        duration: 105,
        passingScore: 100,
        instructions: '',
        isPublic: false,
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [animateIn, setAnimateIn] = useState(false)
    const overlayRef = useRef(null)

    // Populate form when exam data changes
    useEffect(() => {
        if (exam && isOpen) {
            setForm({
                title: exam.title || '',
                description: exam.description || '',
                level: exam.level || 'N5',
                duration: exam.duration || 105,
                passingScore: exam.passingScore || 100,
                instructions: exam.instructions || '',
                isPublic: exam.isPublic ?? false,
            })
            setError(null)
        }
    }, [exam, isOpen])

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setAnimateIn(true))
        } else {
            setAnimateIn(false)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handler = e => e.key === 'Escape' && onClose?.()
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    useEffect(() => {
        if (!isOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [isOpen])

    if (!isOpen || !exam) return null

    const examId = exam._id || exam.id

    const handleOverlayClick = e => {
        if (e.target === overlayRef.current) onClose?.()
    }

    const handleChange = (key, value) => {
        const nextValue = value?.target ? value.target.value : value
        setForm(prev => ({
            ...prev,
            [key]: ['duration', 'passingScore'].includes(key) ? Number(nextValue) : nextValue,
        }))
    }

    const handleSave = async () => {
        // Validate
        if (!form.title.trim()) {
            setError('Tiêu đề đề thi không được để trống')
            return
        }
        if (!form.duration || form.duration < 1) {
            setError('Thời gian phải lớn hơn 0')
            return
        }

        try {
            setSaving(true)
            setError(null)
            const res = await examService.updateExam({
                examId,
                title: form.title.trim(),
                description: form.description.trim(),
                level: form.level,
                duration: Number(form.duration),
                passingScore: Number(form.passingScore) || 0,
                instructions: form.instructions.trim(),
                isPublic: form.isPublic,
            })
            if (res.success) {
                onSuccess?.()
                onClose?.()
            } else {
                setError(res.message || 'Có lỗi xảy ra')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đề thi')
        } finally {
            setSaving(false)
        }
    }

    return createPortal(
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className={cn(
                'fixed inset-0 z-50 flex items-center justify-center p-4 transition-[background-color] duration-150',
                animateIn ? 'bg-[#0F172A]/50' : 'bg-transparent'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Chỉnh sửa thông tin đề thi"
        >
            <div
                className={cn(
                    'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white transition-[opacity,transform] duration-150 will-change-[opacity,transform]',
                    animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                )}
                style={{
                    border: '3px solid rgba(255,255,255,0.7)',
                    boxShadow:
                        '12px 12px 32px rgba(0,0,0,0.12), -6px -6px 16px rgba(255,255,255,0.8), inset 0 2px 0 rgba(255,255,255,0.6)',
                }}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b-2 border-[#E2E8F0] bg-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10">
                            <PencilLine className="size-4 text-[#2563EB]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#1E293B]">
                                Chỉnh sửa thông tin đề thi
                            </h2>
                            <p className="text-xs text-[#94A3B8]">
                                Cập nhật tiêu đề, trình độ, thời gian...
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-9 items-center justify-center rounded-xl text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {error && (
                        <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#1E293B]">
                            Tiêu đề đề thi <span className="text-red-400">*</span>
                        </label>
                        <input
                            value={form.title}
                            onChange={e => handleChange('title', e)}
                            className="h-11 w-full rounded-xl border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            placeholder="VD: Đề thi JLPT N5 – Đề 1"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#1E293B]">Mô tả</label>
                        <textarea
                            value={form.description}
                            onChange={e => handleChange('description', e)}
                            rows={3}
                            className="w-full rounded-xl border-2 border-[#E2E8F0] p-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            placeholder="Mô tả ngắn về đề thi..."
                        />
                    </div>

                    {/* Level */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#1E293B]">
                            Trình độ <span className="text-red-400">*</span>
                        </label>
                        <Select value={form.level} onValueChange={v => handleChange('level', v)}>
                            <SelectTrigger className="h-11 w-full rounded-xl border-2 border-[#E2E8F0]">
                                <SelectValue placeholder="Chọn level" />
                            </SelectTrigger>
                            <SelectContent>
                                {LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>
                                        {level}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Duration & Passing Score */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#1E293B]">
                                Thời gian (phút) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={form.duration}
                                onChange={e => handleChange('duration', e)}
                                className="h-11 w-full rounded-xl border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#1E293B]">Điểm đạt</label>
                            <input
                                type="number"
                                min={0}
                                value={form.passingScore}
                                onChange={e => handleChange('passingScore', e)}
                                className="h-11 w-full rounded-xl border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#1E293B]">
                            Hướng dẫn làm bài
                        </label>
                        <textarea
                            value={form.instructions}
                            onChange={e => handleChange('instructions', e)}
                            rows={3}
                            className="w-full rounded-xl border-2 border-[#E2E8F0] p-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            placeholder="Hướng dẫn cho thí sinh trước khi làm bài..."
                        />
                    </div>

                    {/* Public toggle */}
                    <label className="flex items-center gap-3 rounded-xl border-2 border-[#E2E8F0] p-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors">
                        <input
                            type="checkbox"
                            checked={form.isPublic}
                            onChange={e =>
                                setForm(prev => ({ ...prev, isPublic: e.target.checked }))
                            }
                            className="size-4 rounded accent-[#2563EB]"
                        />
                        <div>
                            <p className="text-sm font-semibold text-[#1E293B]">Công khai</p>
                            <p className="text-xs text-[#64748B]">
                                Cho phép người học xem và làm đề thi này
                            </p>
                        </div>
                    </label>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center justify-end gap-2 rounded-b-3xl border-t-2 border-[#E2E8F0] bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="h-10 rounded-xl border-2 border-[#E2E8F0] px-5 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {saving && <Loader2 className="size-4 animate-spin" />}
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}