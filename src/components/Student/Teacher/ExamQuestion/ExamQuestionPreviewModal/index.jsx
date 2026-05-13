import { cn } from '@/lib/utils'
import { aiService } from '@/services'
import {
    BookOpen,
    CheckCircle2,
    Edit3,
    FileText,
    Image,
    Loader2,
    Music,
    Sparkles,
    X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SECTION_LABELS = {
    vocabulary: 'Từ vựng',
    grammar: 'Ngữ pháp',
    reading: 'Đọc hiểu',
    listening: 'Nghe hiểu',
}

const SECTION_COLORS = {
    vocabulary: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    grammar: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    reading: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    listening: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
}

/**
 * Modal xem trước câu hỏi trong đề thi
 * - Hiển thị chi tiết câu hỏi + đáp án + giải thích
 * - Nút chỉnh sửa → gọi callback onEdit
 */
export default function ExamQuestionPreviewModal({
    isOpen,
    onClose,
    question,
    questionNumber,
    sectionType,
    blockContext,
    examLevel,
    onEdit,
}) {
    const [animateIn, setAnimateIn] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState(null)
    const [localQuestion, setLocalQuestion] = useState(question)
    const overlayRef = useRef(null)

    // Sync localQuestion when question prop changes
    useEffect(() => {
        setLocalQuestion(question)
        setAiError(null)
    }, [question])

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

    if (!isOpen || !question) return null

    const q = localQuestion || question

    const handleAiExplain = async () => {
        setAiLoading(true)
        setAiError(null)
        try {
            const res = await aiService.generateExplanation({
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                level: examLevel,
                sectionType,
                context: blockContext?.text || '',
                questionId: q._id,
            })
            const data = res?.data || res
            setLocalQuestion(prev => ({
                ...prev,
                explanation: data.explanation,
                translationVi: data.translationVi,
            }))
        } catch {
            setAiError('Không thể tạo giải thích')
        } finally {
            setAiLoading(false)
        }
    }

    const handleOverlayClick = e => {
        if (e.target === overlayRef.current) onClose?.()
    }

    const sc = SECTION_COLORS[sectionType] || SECTION_COLORS.vocabulary
    const sectionLabel = SECTION_LABELS[sectionType] || sectionType || ''
    const hasContext = blockContext?.text || blockContext?.audioUrl || blockContext?.imageUrl

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
            aria-label="Xem trước câu hỏi"
        >
            <div
                className={cn(
                    'relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white transition-[opacity,transform] duration-150 will-change-[opacity,transform]',
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
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10">
                            <BookOpen className="size-4 text-[#2563EB]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-black text-[#1E293B]">
                                Câu hỏi {questionNumber || ''}
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                {sectionLabel && (
                                    <span
                                        className={cn(
                                            'rounded-md px-2 py-0.5 text-[10px] font-bold',
                                            sc.bg,
                                            sc.text
                                        )}
                                    >
                                        {sectionLabel}
                                    </span>
                                )}
                                {question.points && (
                                    <span className="text-xs text-[#94A3B8]">
                                        {question.points} điểm
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-xl p-2 text-[#94A3B8] transition-colors duration-200 hover:bg-[#F1F5F9] hover:text-[#475569] cursor-pointer"
                        aria-label="Đóng"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-5 px-6 py-5">
                    {/* Context (if block has shared context) */}
                    {hasContext && (
                        <div
                            className="space-y-3 rounded-2xl border-2 border-dashed border-[#2563EB]/20 bg-[#EFF6FF]/50 p-4"
                            style={{ boxShadow: 'inset 0 2px 4px rgba(37,99,235,0.04)' }}
                        >
                            <h4 className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
                                <FileText className="size-4 text-[#2563EB]" />
                                Context chung
                            </h4>

                            {blockContext.text && (
                                <div className="rounded-xl bg-white p-3 text-sm leading-relaxed text-[#334155] whitespace-pre-wrap border border-[#E2E8F0]">
                                    {blockContext.text}
                                </div>
                            )}

                            {blockContext.imageUrl && (
                                <div className="flex items-center gap-2">
                                    <Image className="size-4 text-[#94A3B8]" />
                                    <img
                                        src={blockContext.imageUrl}
                                        alt="context"
                                        className="max-h-48 rounded-lg object-contain border border-[#E2E8F0]"
                                    />
                                </div>
                            )}

                            {blockContext.audioUrl && (
                                <div className="flex items-center gap-2">
                                    <Music className="size-4 text-[#94A3B8]" />
                                    <audio
                                        src={blockContext.audioUrl}
                                        controls
                                        className="h-9 flex-1"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Question text */}
                    <div className="rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] p-5">
                        <p className="text-base leading-relaxed text-[#1E293B] font-medium whitespace-pre-wrap">
                            {q.questionText}
                        </p>
                    </div>

                    {/* Media */}
                    {(q.media?.image || q.media?.audio) && (
                        <div className="flex flex-wrap items-center gap-3">
                            {q.media.image && (
                                <img
                                    src={q.media.image}
                                    alt="question media"
                                    className="max-h-48 rounded-xl object-contain border-2 border-[#E2E8F0]"
                                />
                            )}
                            {q.media.audio && (
                                <audio src={q.media.audio} controls className="h-9" />
                            )}
                        </div>
                    )}

                    {/* Options */}
                    <div className="space-y-2.5">
                        <h4 className="text-sm font-bold text-[#475569]">Các đáp án</h4>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {q.options?.map(opt => {
                                const isCorrect = opt.label === q.correctAnswer
                                return (
                                    <div
                                        key={opt.label}
                                        className={cn(
                                            'flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-sm transition-all',
                                            isCorrect
                                                ? 'border-[#22C55E] bg-[#22C55E]/5'
                                                : 'border-[#E2E8F0] bg-white'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black',
                                                isCorrect
                                                    ? 'bg-[#22C55E] text-white'
                                                    : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                                            )}
                                        >
                                            {isCorrect ? (
                                                <CheckCircle2 className="size-4" />
                                            ) : (
                                                opt.label
                                            )}
                                        </span>
                                        <span
                                            className={cn(
                                                'pt-0.5 leading-relaxed',
                                                isCorrect
                                                    ? 'font-semibold text-[#16A34A]'
                                                    : 'text-[#475569]'
                                            )}
                                        >
                                            {opt.text}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Explanation & Translation */}
                    {q.explanation || q.translationVi ? (
                        <div className="space-y-3 rounded-2xl bg-[#F8FAFC] p-4 border-2 border-[#E2E8F0]">
                            {q.explanation && (
                                <div>
                                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                                        Giải thích
                                    </span>
                                    <div
                                        className="mt-1 text-sm text-[#64748B] leading-relaxed whitespace-pre-wrap [&_b]:font-bold [&_br]:block"
                                        dangerouslySetInnerHTML={{ __html: q.explanation }}
                                    />
                                </div>
                            )}
                            {q.translationVi && (
                                <div>
                                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                                        Dịch tiếng Việt
                                    </span>
                                    <p className="mt-1 text-sm text-[#64748B] leading-relaxed">
                                        {q.translationVi}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleAiExplain}
                                disabled={aiLoading}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer',
                                    'bg-linear-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600',
                                    'shadow-[0_2px_8px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_12px_rgba(139,92,246,0.35)]',
                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                )}
                            >
                                {aiLoading ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="size-3.5" />
                                )}
                                {aiLoading ? 'Đang tạo giải thích...' : 'AI giải thích'}
                            </button>
                            {aiError && <span className="text-xs text-red-500">{aiError}</span>}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex justify-between items-center rounded-b-3xl border-t-2 border-[#E2E8F0] bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={() => {
                            onEdit?.(question)
                            onClose()
                        }}
                        className="inline-flex items-center gap-2 h-10 rounded-xl border-2 border-[#2563EB] bg-[#2563EB]/5 px-5 text-sm font-semibold text-[#2563EB] transition-all duration-200 hover:bg-[#2563EB]/10 cursor-pointer"
                    >
                        <Edit3 className="size-4" />
                        Chỉnh sửa câu hỏi
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl border-2 border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#64748B] transition-all duration-200 hover:bg-[#F1F5F9] cursor-pointer"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}