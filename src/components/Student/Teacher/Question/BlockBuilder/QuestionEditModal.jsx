import { cn } from '@/lib/utils'
import axiosInstance from '@/services/axiosInstance'
import {
    ChevronDown,
    ChevronUp,
    FileText,
    Image,
    Loader2,
    Music,
    Sparkles,
    Upload,
    X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DIFFICULTIES, OPTION_LABELS } from './constants'

const inputCls =
    'h-10 w-full rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm text-[#1E293B] outline-none transition-all duration-200 placeholder:text-[#94A3B8] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
const textareaCls =
    'w-full rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#1E293B] resize-y outline-none transition-all duration-200 placeholder:text-[#94A3B8] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
const selectCls =
    'h-10 w-full cursor-pointer appearance-none rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] px-3 pr-9 text-sm text-[#1E293B] outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'

/**
 * Claymorphism modal to edit a single question's full details.
 * Uses createPortal for proper overlay stacking. No shadcn dependency.
 */
export default function QuestionEditModal({
    isOpen,
    onClose,
    question,
    onSave,
    blockContext,
    onSaveBlockContext,
}) {
    const [form, setForm] = useState(null)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [showCtxPanel, setShowCtxPanel] = useState(false)
    const [ctxForm, setCtxForm] = useState({
        text: '',
        audioUrl: '',
        imageUrl: '',
        _audioFile: null,
        _imageFile: null,
    })
    const [aiLoading, setAiLoading] = useState(false)
    const [animateIn, setAnimateIn] = useState(false)
    const overlayRef = useRef(null)
    const imageInputRef = useRef(null)
    const audioInputRef = useRef(null)
    const ctxAudioInputRef = useRef(null)
    const ctxImageInputRef = useRef(null)

    useEffect(() => {
        if (question) {
            setForm({ ...question })
            setShowAdvanced(
                !!(
                    question.explanation ||
                    question.translationVi ||
                    question.media?.image ||
                    question.media?.audio
                )
            )
        }
    }, [question])

    // Sync block context when modal opens
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

    // Animate in
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setAnimateIn(true))
        } else {
            setAnimateIn(false)
        }
    }, [isOpen])

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return
        const handler = e => e.key === 'Escape' && onClose?.()
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    // Lock body scroll
    useEffect(() => {
        if (!isOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [isOpen])

    if (!isOpen || !form) return null

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
    const updateOption = (label, text) =>
        setForm(prev => ({
            ...prev,
            options: prev.options.map(o => (o.label === label ? { ...o, text } : o)),
        }))
    const updateMedia = (key, value) =>
        setForm(prev => ({ ...prev, media: { ...prev.media, [key]: value } }))

    // Store image file locally — actual upload deferred to submit time
    const handleImageUpload = e => {
        const file = e.target.files?.[0]
        if (!file) return
        // Revoke old blob URL if exists
        if (form?.media?._imageFile) {
            URL.revokeObjectURL(form.media.image)
        }
        const previewUrl = URL.createObjectURL(file)
        setForm(prev => ({
            ...prev,
            media: { ...prev.media, image: previewUrl, _imageFile: file },
        }))
    }

    // Store audio file locally — actual upload deferred to submit time
    const handleAudioUpload = e => {
        const file = e.target.files?.[0]
        if (!file) return
        // Revoke old blob URL if exists
        if (form?.media?._audioFile) {
            URL.revokeObjectURL(form.media.audio)
        }
        const previewUrl = URL.createObjectURL(file)
        setForm(prev => ({
            ...prev,
            media: { ...prev.media, audio: previewUrl, _audioFile: file },
        }))
    }

    // AI generate explanation
    const handleAiExplain = async () => {
        if (!form.questionText) return
        setAiLoading(true)
        try {
            const res = await axiosInstance.post('/questions/ai-explain', {
                questionText: form.questionText,
                options: form.options,
                correctAnswer: form.correctAnswer,
            })
            const explanation = res.data?.data?.explanation || ''
            if (explanation) updateField('explanation', explanation)
        } catch (err) {
            console.error('AI explain failed:', err)
        } finally {
            setAiLoading(false)
        }
    }

    const handleSave = () => {
        onSave?.(form, ctxForm)
        onClose?.()
    }

    // Context audio upload
    const handleCtxAudioUpload = e => {
        const file = e.target.files?.[0]
        if (!file) return
        if (ctxForm._audioFile) URL.revokeObjectURL(ctxForm.audioUrl)
        const previewUrl = URL.createObjectURL(file)
        setCtxForm(prev => ({ ...prev, audioUrl: previewUrl, _audioFile: file }))
    }

    // Context image upload
    const handleCtxImageUpload = e => {
        const file = e.target.files?.[0]
        if (!file) return
        if (ctxForm._imageFile) URL.revokeObjectURL(ctxForm.imageUrl)
        const previewUrl = URL.createObjectURL(file)
        setCtxForm(prev => ({ ...prev, imageUrl: previewUrl, _imageFile: file }))
    }

    const handleOverlayClick = e => {
        if (e.target === overlayRef.current) onClose?.()
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
            aria-label="Chỉnh sửa câu hỏi"
        >
            {/* Modal card */}
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
                    <h2 className="text-lg font-black text-[#1E293B]">Chỉnh sửa câu hỏi</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-[#94A3B8] transition-colors duration-200 hover:bg-[#F1F5F9] hover:text-[#475569] cursor-pointer"
                        aria-label="Đóng"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-5 px-6 py-5">
                    {/* Question text */}
                    <div className="space-y-2">
                        <label
                            htmlFor="questionText"
                            className="block text-sm font-bold text-[#1E293B]"
                        >
                            Nội dung câu hỏi <span className="text-[#F97316]">*</span>
                        </label>
                        <textarea
                            id="questionText"
                            value={form.questionText}
                            onChange={e => updateField('questionText', e.target.value)}
                            placeholder="Nhập nội dung câu hỏi..."
                            rows={3}
                            className={textareaCls}
                        />
                    </div>

                    {/* Options + Correct answer */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-[#1E293B]">
                            Đáp án{' '}
                            <span className="text-xs font-normal text-[#64748B]">
                                (chọn = đáp án đúng)
                            </span>{' '}
                            <span className="text-[#F97316]">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {OPTION_LABELS.map(label => {
                                const isCorrect = form.correctAnswer === label
                                return (
                                    <div key={label} className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => updateField('correctAnswer', label)}
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all duration-200 cursor-pointer',
                                                isCorrect
                                                    ? 'bg-[#22C55E] text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)]'
                                                    : 'border-2 border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8] hover:border-[#CBD5E1] hover:text-[#64748B]'
                                            )}
                                            aria-label={`Chọn ${label} là đáp án đúng`}
                                        >
                                            {label}
                                        </button>
                                        <input
                                            type="text"
                                            value={
                                                form.options.find(o => o.label === label)?.text ||
                                                ''
                                            }
                                            onChange={e => updateOption(label, e.target.value)}
                                            placeholder={`Đáp án ${label}`}
                                            className={cn(
                                                inputCls,
                                                isCorrect && 'border-[#22C55E]/40 bg-[#22C55E]/5'
                                            )}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-[#1E293B]">Độ khó</label>
                        <div className="relative">
                            <select
                                value={form.difficulty}
                                onChange={e => updateField('difficulty', e.target.value)}
                                className={selectCls}
                            >
                                {DIFFICULTIES.map(d => (
                                    <option key={d.value} value={d.value}>
                                        {d.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                        </div>
                    </div>

                    {/* Advanced toggle */}
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(prev => !prev)}
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#64748B] transition-all duration-200 hover:bg-[#F1F5F9] hover:text-[#2563EB] cursor-pointer"
                    >
                        {showAdvanced ? (
                            <ChevronUp className="size-4" />
                        ) : (
                            <ChevronDown className="size-4" />
                        )}
                        {showAdvanced ? 'Ẩn' : 'Hiện'} thêm (giải thích, dịch, media)
                    </button>

                    {showAdvanced && (
                        <div
                            className="space-y-4 rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC]/60 p-4"
                            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                        >
                            {/* Explanation with AI button */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="explanation"
                                        className="block text-xs font-semibold text-[#475569]"
                                    >
                                        Giải thích
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAiExplain}
                                        disabled={aiLoading || !form.questionText}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
                                            'bg-linear-to-r from-[#8B5CF6] to-[#6366F1] text-white hover:from-[#7C3AED] hover:to-[#4F46E5]',
                                            'shadow-[0_2px_8px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_12px_rgba(139,92,246,0.35)]',
                                            'disabled:opacity-50 disabled:cursor-not-allowed'
                                        )}
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
                                    id="explanation"
                                    value={form.explanation}
                                    onChange={e => updateField('explanation', e.target.value)}
                                    placeholder="Giải thích đáp án (tùy chọn)..."
                                    rows={2}
                                    className={textareaCls}
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="translationVi"
                                    className="block text-xs font-semibold text-[#475569]"
                                >
                                    Dịch tiếng Việt
                                </label>
                                <input
                                    type="text"
                                    id="translationVi"
                                    value={form.translationVi}
                                    onChange={e => updateField('translationVi', e.target.value)}
                                    placeholder="Bản dịch tiếng Việt (tùy chọn)..."
                                    className={inputCls}
                                />
                            </div>

                            {/* File upload for image & audio */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
                                        <Image className="size-3.5 text-[#94A3B8]" />
                                        Hình ảnh
                                    </label>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    {form.media?.image ? (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={form.media.image}
                                                alt="preview"
                                                className="h-16 w-16 rounded-lg object-cover border-2 border-[#E2E8F0]"
                                            />
                                            {form.media?._imageFile && (
                                                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                                    Chưa upload
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (form.media?._imageFile) {
                                                        URL.revokeObjectURL(form.media.image)
                                                    }
                                                    setForm(prev => ({
                                                        ...prev,
                                                        media: {
                                                            ...prev.media,
                                                            image: '',
                                                            _imageFile: null,
                                                        },
                                                    }))
                                                    if (imageInputRef.current)
                                                        imageInputRef.current.value = ''
                                                }}
                                                className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            className={cn(
                                                'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] py-3 text-sm text-[#94A3B8] transition-all duration-200 hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 hover:text-[#2563EB] cursor-pointer'
                                            )}
                                        >
                                            <Upload className="size-4" />
                                            Chọn hình ảnh
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
                                        <Music className="size-3.5 text-[#94A3B8]" />
                                        Audio
                                    </label>
                                    <input
                                        ref={audioInputRef}
                                        type="file"
                                        accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/mpeg"
                                        onChange={handleAudioUpload}
                                        className="hidden"
                                    />
                                    {form.media?.audio ? (
                                        <div className="space-y-2">
                                            <audio
                                                src={form.media.audio}
                                                controls
                                                className="w-full h-8"
                                            />
                                            <div className="flex items-center gap-2">
                                                {form.media?._audioFile && (
                                                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                                        Chưa upload
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (form.media?._audioFile) {
                                                            URL.revokeObjectURL(form.media.audio)
                                                        }
                                                        setForm(prev => ({
                                                            ...prev,
                                                            media: {
                                                                ...prev.media,
                                                                audio: '',
                                                                _audioFile: null,
                                                            },
                                                        }))
                                                        if (audioInputRef.current)
                                                            audioInputRef.current.value = ''
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    Xóa audio
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => audioInputRef.current?.click()}
                                            className={cn(
                                                'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] py-3 text-sm text-[#94A3B8] transition-all duration-200 hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 hover:text-[#2563EB] cursor-pointer'
                                            )}
                                        >
                                            <Upload className="size-4" />
                                            Chọn audio
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Block Context chung (audio/image) ── */}
                    <div className="rounded-2xl border-2 border-dashed border-[#22C55E]/30 bg-[#F0FDF4]/60 p-4 space-y-3">
                        <button
                            type="button"
                            onClick={() => setShowCtxPanel(p => !p)}
                            className="flex w-full items-center justify-between text-sm font-bold text-[#16A34A] cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <FileText className="size-4" />
                                Context chung (audio / hình ảnh cho cả nhóm)
                            </span>
                            {showCtxPanel ? (
                                <ChevronUp className="size-4" />
                            ) : (
                                <ChevronDown className="size-4" />
                            )}
                        </button>

                        {showCtxPanel && (
                            <div className="space-y-3 pt-1">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-[#475569]">
                                        Đoạn văn / Nội dung chung
                                    </label>
                                    <textarea
                                        value={ctxForm.text}
                                        onChange={e =>
                                            setCtxForm(p => ({ ...p, text: e.target.value }))
                                        }
                                        placeholder="Nhập đoạn văn, hướng dẫn chung cho cả nhóm câu hỏi..."
                                        rows={3}
                                        className={textareaCls}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {/* Context audio */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
                                            <Music className="size-3.5 text-[#94A3B8]" />
                                            Audio chung
                                        </label>
                                        <input
                                            ref={ctxAudioInputRef}
                                            type="file"
                                            accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/mpeg"
                                            onChange={handleCtxAudioUpload}
                                            className="hidden"
                                        />
                                        {ctxForm.audioUrl ? (
                                            <div className="space-y-1.5">
                                                <audio
                                                    src={ctxForm.audioUrl}
                                                    controls
                                                    className="w-full h-8"
                                                />
                                                <div className="flex items-center gap-2">
                                                    {ctxForm._audioFile && (
                                                        <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                                            Chưa upload
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (ctxForm._audioFile)
                                                                URL.revokeObjectURL(
                                                                    ctxForm.audioUrl
                                                                )
                                                            setCtxForm(p => ({
                                                                ...p,
                                                                audioUrl: '',
                                                                _audioFile: null,
                                                            }))
                                                            if (ctxAudioInputRef.current)
                                                                ctxAudioInputRef.current.value = ''
                                                        }}
                                                        className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                                                    >
                                                        Xóa audio
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => ctxAudioInputRef.current?.click()}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] py-2.5 text-sm text-[#94A3B8] hover:border-[#22C55E]/40 hover:bg-[#22C55E]/5 hover:text-[#22C55E] transition-all duration-200 cursor-pointer"
                                            >
                                                <Upload className="size-4" />
                                                Chọn audio
                                            </button>
                                        )}
                                    </div>
                                    {/* Context image */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
                                            <Image className="size-3.5 text-[#94A3B8]" />
                                            Hình ảnh chung
                                        </label>
                                        <input
                                            ref={ctxImageInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={handleCtxImageUpload}
                                            className="hidden"
                                        />
                                        {ctxForm.imageUrl ? (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <img
                                                    src={ctxForm.imageUrl}
                                                    alt="ctx preview"
                                                    className="h-14 w-14 rounded-lg object-cover border-2 border-[#E2E8F0]"
                                                />
                                                {ctxForm._imageFile && (
                                                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                                        Chưa upload
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (ctxForm._imageFile)
                                                            URL.revokeObjectURL(ctxForm.imageUrl)
                                                        setCtxForm(p => ({
                                                            ...p,
                                                            imageUrl: '',
                                                            _imageFile: null,
                                                        }))
                                                        if (ctxImageInputRef.current)
                                                            ctxImageInputRef.current.value = ''
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => ctxImageInputRef.current?.click()}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] py-2.5 text-sm text-[#94A3B8] hover:border-[#22C55E]/40 hover:bg-[#22C55E]/5 hover:text-[#22C55E] transition-all duration-200 cursor-pointer"
                                            >
                                                <Upload className="size-4" />
                                                Chọn hình ảnh
                                            </button>
                                        )}
                                    </div>
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
                        className="h-10 rounded-xl border-2 border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#475569] transition-all duration-200 hover:bg-[#F1F5F9] cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="h-10 rounded-xl bg-[#2563EB] px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#1D4ED8] cursor-pointer"
                        style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}