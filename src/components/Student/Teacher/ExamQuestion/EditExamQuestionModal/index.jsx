import { cn } from '@/lib/utils'
import { aiService, examService } from '@/services'
import axiosInstance from '@/services/axiosInstance'
import {
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Edit3,
    FileText,
    Image,
    Loader2,
    Music,
    Save,
    Sparkles,
    Upload,
    X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Modal chỉnh sửa 1 câu hỏi embedded trong đề thi
 * Hỗ trợ: text/options/answer/explanation/points + media (ảnh, audio) + context chung của nhóm câu hỏi
 */
export default function EditExamQuestionModal({
    isOpen,
    onClose,
    examId,
    sectionIndex,
    blockIndex,
    questionIndex,
    questionData,
    onSuccess,
    level,
    sectionType,
    blockContext,
}) {
    const [animateIn, setAnimateIn] = useState(false)
    const [saving, setSaving] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}))
    const [showCtxPanel, setShowCtxPanel] = useState(false)
    const overlayRef = useRef(null)
    const ctxAudioInputRef = useRef(null)
    const ctxImageInputRef = useRef(null)

    const [form, setForm] = useState({
        questionText: '',
        options: [
            { label: '1', text: '' },
            { label: '2', text: '' },
            { label: '3', text: '' },
            { label: '4', text: '' },
        ],
        correctAnswer: '1',
        explanation: '',
        translationVi: '',
        points: 1,
    })

    const [ctxForm, setCtxForm] = useState({
        text: '',
        audioUrl: '',
        imageUrl: '',
        _audioFile: null,
        _imageFile: null,
    })

    useEffect(() => {
        if (isOpen && questionData) {
            setForm({
                questionText: questionData.questionText || '',
                options:
                    questionData.options?.length > 0
                        ? questionData.options.map(o => ({ label: o.label, text: o.text }))
                        : [
                              { label: '1', text: '' },
                              { label: '2', text: '' },
                              { label: '3', text: '' },
                              { label: '4', text: '' },
                          ],
                correctAnswer: questionData.correctAnswer || '1',
                explanation: questionData.explanation || '',
                translationVi: questionData.translationVi || '',
                points: questionData.points || 1,
                // preserve existing media unchanged
                media: questionData.media || {},
            })
            setErrors({})
        }
    }, [isOpen, questionData])

    useEffect(() => {
        if (isOpen && blockContext) {
            setCtxForm({
                text: blockContext.text || '',
                audioUrl: blockContext.audioUrl || '',
                imageUrl: blockContext.imageUrl || '',
                _audioFile: null,
                _imageFile: null,
            })
            setShowCtxPanel(!!(blockContext.audioUrl || blockContext.imageUrl || blockContext.text))
        } else if (isOpen) {
            setCtxForm({ text: '', audioUrl: '', imageUrl: '', _audioFile: null, _imageFile: null })
            setShowCtxPanel(false)
        }
    }, [isOpen, blockContext])

    useEffect(() => {
        if (isOpen) requestAnimationFrame(() => setAnimateIn(true))
        else setAnimateIn(false)
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

    const validate = () => {
        const errs = /** @type {Record<string, string>} */ ({})
        if (!form.questionText.trim()) errs.questionText = 'Vui lòng nhập nội dung câu hỏi'
        if (form.options.some(o => !o.text.trim())) errs.options = 'Vui lòng nhập đầy đủ các đáp án'
        if (!form.correctAnswer) errs.correctAnswer = 'Vui lòng chọn đáp án đúng'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    /** Upload a file to /upload/image or /upload/audio and return the URL */
    const uploadFile = async (file, type) => {
        const fd = new FormData()
        fd.append(type, file)
        const res = await axiosInstance.post(`/upload/${type}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return res.data?.data?.url || ''
    }

    const handleSave = async () => {
        if (!validate()) return
        try {
            setSaving(true)

            const questionPayload = { ...form }

            await examService.updateExamQuestion({
                examId,
                sectionIndex,
                blockIndex,
                questionIndex,
                questionData: questionPayload,
            })

            // --- upload context media if new files selected ---
            let ctxAudioUrl = ctxForm.audioUrl
            let ctxImageUrl = ctxForm.imageUrl
            if (ctxForm._audioFile) {
                ctxAudioUrl = await uploadFile(ctxForm._audioFile, 'audio')
            }
            if (ctxForm._imageFile) {
                ctxImageUrl = await uploadFile(ctxForm._imageFile, 'image')
            }

            const ctxChanged =
                ctxForm._audioFile ||
                ctxForm._imageFile ||
                ctxForm.text !== (blockContext?.text || '') ||
                ctxAudioUrl !== (blockContext?.audioUrl || '') ||
                ctxImageUrl !== (blockContext?.imageUrl || '')

            if (ctxChanged) {
                await examService.updateBlockContext({
                    examId,
                    sectionIndex,
                    blockIndex,
                    contextData: {
                        text: ctxForm.text,
                        audioUrl: ctxAudioUrl,
                        imageUrl: ctxImageUrl,
                    },
                })
            }

            onSuccess?.()
            onClose()
        } catch (err) {
            console.error('Failed to update question:', err)
            alert('Có lỗi xảy ra khi cập nhật câu hỏi')
        } finally {
            setSaving(false)
        }
    }

    const updateOption = (index, value) => {
        setForm(prev => ({
            ...prev,
            options: prev.options.map((o, i) => (i === index ? { ...o, text: value } : o)),
        }))
    }

    const handleCtxAudioUpload = e => {
        const file = e.target.files?.[0]
        if (!file) return
        if (ctxForm._audioFile) URL.revokeObjectURL(ctxForm.audioUrl)
        const previewUrl = URL.createObjectURL(file)
        setCtxForm(prev => ({ ...prev, audioUrl: previewUrl, _audioFile: file }))
    }

    const handleCtxImageUpload = e => {
        const file = e.target.files?.[0]
        if (!file) return
        if (ctxForm._imageFile) URL.revokeObjectURL(ctxForm.imageUrl)
        const previewUrl = URL.createObjectURL(file)
        setCtxForm(prev => ({ ...prev, imageUrl: previewUrl, _imageFile: file }))
    }

    const handleAiExplain = async () => {
        if (aiLoading || !form.questionText.trim()) return
        try {
            setAiLoading(true)
            const res = await aiService.generateExplanation({
                questionText: form.questionText,
                options: form.options,
                correctAnswer: form.correctAnswer,
                level: level || 'N5',
                sectionType: sectionType || 'vocabulary',
                context: blockContext || undefined,
                questionId: undefined,
            })
            const data = res.data || res
            if (data.explanation) {
                setForm(prev => ({
                    ...prev,
                    explanation: data.explanation,
                    ...(data.translationVi ? { translationVi: data.translationVi } : {}),
                }))
            }
        } catch (err) {
            console.error('AI explain failed:', err)
        } finally {
            setAiLoading(false)
        }
    }

    const handleOverlayClick = e => {
        if (e.target === overlayRef.current) onClose?.()
    }

    if (!isOpen) return null

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
        >
            {/* Hidden file inputs (context only) */}
            <input ref={ctxImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleCtxImageUpload} />
            <input ref={ctxAudioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleCtxAudioUpload} />

            <div
                className={cn(
                    'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white transition-[opacity,transform] duration-150',
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
                        <div className="flex size-9 items-center justify-center rounded-xl bg-[#F97316]/10">
                            <Edit3 className="size-4 text-[#F97316]" />
                        </div>
                        <h2 className="text-lg font-black text-[#1E293B]">Chỉnh sửa câu hỏi</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-5 px-6 py-5">
                    {/* Question text */}
                    <div>
                        <label className="block text-sm font-bold text-[#1E293B] mb-2">
                            Nội dung câu hỏi <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.questionText}
                            onChange={e =>
                                setForm(prev => ({ ...prev, questionText: e.target.value }))
                            }
                            rows={3}
                            className={cn(
                                'w-full rounded-xl border-2 p-3 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none resize-none transition-colors',
                                errors.questionText
                                    ? 'border-red-300 focus:border-red-400'
                                    : 'border-[#E2E8F0] focus:border-[#2563EB]'
                            )}
                            placeholder="Nhập nội dung câu hỏi..."
                        />
                        {errors.questionText && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle className="size-3" />
                                {errors.questionText}
                            </p>
                        )}
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-sm font-bold text-[#1E293B] mb-2">
                            Đáp án <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {form.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setForm(prev => ({
                                                ...prev,
                                                correctAnswer: opt.label,
                                            }))
                                        }
                                        className={cn(
                                            'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold border-2 transition-colors cursor-pointer',
                                            form.correctAnswer === opt.label
                                                ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                                : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#94A3B8]'
                                        )}
                                        title={`Chọn ${opt.label} là đáp án đúng`}
                                    >
                                        {opt.label}
                                    </button>
                                    <input
                                        type="text"
                                        value={opt.text}
                                        onChange={e => updateOption(i, e.target.value)}
                                        placeholder={`Đáp án ${opt.label}`}
                                        className="flex-1 h-10 rounded-xl border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] placeholder:text-[#CBD5E1] focus:border-[#2563EB] focus:outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        {errors.options && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle className="size-3" />
                                {errors.options}
                            </p>
                        )}
                        <p className="mt-1.5 text-[11px] text-[#94A3B8]">
                            Click vào số để chọn đáp án đúng (đang chọn:{' '}
                            <span className="font-bold text-[#22C55E]">{form.correctAnswer}</span>)
                        </p>
                    </div>

                    {/* Explanation */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-[#1E293B]">Giải thích</label>
                            <button
                                type="button"
                                onClick={handleAiExplain}
                                disabled={aiLoading || !form.questionText.trim()}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-violet-500 to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 transition-all cursor-pointer"
                                title="Tạo giải thích bằng AI"
                            >
                                {aiLoading ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="size-3.5" />
                                )}
                                {aiLoading ? 'Đang tạo...' : 'AI giải thích'}
                            </button>
                        </div>
                        <textarea
                            value={form.explanation}
                            onChange={e =>
                                setForm(prev => ({ ...prev, explanation: e.target.value }))
                            }
                            rows={2}
                            className="w-full rounded-xl border-2 border-[#E2E8F0] p-3 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none resize-none"
                            placeholder="Giải thích đáp án (không bắt buộc)..."
                        />
                    </div>

                    {/* Translation */}
                    <div>
                        <label className="block text-sm font-bold text-[#1E293B] mb-2">
                            Dịch tiếng Việt
                        </label>
                        <input
                            type="text"
                            value={form.translationVi}
                            onChange={e =>
                                setForm(prev => ({ ...prev, translationVi: e.target.value }))
                            }
                            className="w-full h-10 rounded-xl border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none"
                            placeholder="Dịch nghĩa tiếng Việt (không bắt buộc)..."
                        />
                    </div>

                    {/* Points */}
                    <div>
                        <label className="block text-sm font-bold text-[#1E293B] mb-2">Điểm</label>
                        <input
                            type="number"
                            min="1"
                            value={form.points}
                            onChange={e =>
                                setForm(prev => ({
                                    ...prev,
                                    points: parseInt(e.target.value) || 1,
                                }))
                            }
                            className="w-24 h-10 rounded-xl border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] focus:border-[#2563EB] focus:outline-none"
                        />
                    </div>

                    {/* ── Context chung của nhóm câu hỏi (collapsible) ── */}
                    <div className="rounded-2xl border-2 border-[#E2E8F0] overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowCtxPanel(v => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                        >
                            <span className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
                                <FileText className="size-4 text-[#7C3AED]" />
                                Context chung của nhóm câu hỏi
                                {(ctxForm.audioUrl || ctxForm.imageUrl || ctxForm.text) && (
                                    <span className="inline-flex items-center rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
                                        Đã có
                                    </span>
                                )}
                            </span>
                            {showCtxPanel ? (
                                <ChevronUp className="size-4 text-[#94A3B8]" />
                            ) : (
                                <ChevronDown className="size-4 text-[#94A3B8]" />
                            )}
                        </button>

                        {showCtxPanel && (
                            <div className="px-4 pb-4 pt-3 space-y-3 border-t-2 border-[#E2E8F0]">
                                {/* Context text */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                                        Văn bản / bài đọc chung
                                    </label>
                                    <textarea
                                        value={ctxForm.text}
                                        onChange={e =>
                                            setCtxForm(prev => ({ ...prev, text: e.target.value }))
                                        }
                                        rows={3}
                                        className="w-full rounded-xl border-2 border-[#E2E8F0] p-3 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:outline-none resize-none"
                                        placeholder="Đoạn văn / bài đọc chung cho các câu hỏi trong nhóm..."
                                    />
                                </div>

                                {/* Context image */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => ctxImageInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer"
                                    >
                                        <Upload className="size-3.5" />
                                        {ctxForm.imageUrl ? 'Đổi ảnh context' : 'Ảnh context'}
                                    </button>
                                    {ctxForm.imageUrl ? (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={ctxForm.imageUrl}
                                                alt="ctx preview"
                                                className="h-10 w-10 rounded-lg object-cover border border-[#E2E8F0]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCtxForm(prev => ({
                                                        ...prev,
                                                        imageUrl: '',
                                                        _imageFile: null,
                                                    }))
                                                }
                                                className="text-[#94A3B8] hover:text-red-500 transition-colors cursor-pointer"
                                                title="Xóa ảnh context"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                                            <Image className="size-3.5" /> Chưa có ảnh
                                        </span>
                                    )}
                                </div>

                                {/* Context audio */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => ctxAudioInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors cursor-pointer"
                                    >
                                        <Upload className="size-3.5" />
                                        {ctxForm.audioUrl ? 'Đổi audio context' : 'Audio context'}
                                    </button>
                                    {ctxForm.audioUrl ? (
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <audio
                                                src={ctxForm.audioUrl}
                                                controls
                                                className="h-8 w-full max-w-xs"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCtxForm(prev => ({
                                                        ...prev,
                                                        audioUrl: '',
                                                        _audioFile: null,
                                                    }))
                                                }
                                                className="text-[#94A3B8] hover:text-red-500 transition-colors cursor-pointer shrink-0"
                                                title="Xóa audio context"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                                            <Music className="size-3.5" /> Chưa có audio
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex justify-end gap-2 rounded-b-3xl border-t-2 border-[#E2E8F0] bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl border-2 border-[#E2E8F0] px-5 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="h-10 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                        {saving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}