import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import { aiService } from '@/services'
import { questionBlockService } from '@/services/QuestionBlockService'
import useAuthStore from '@/stores/authStore'
import {
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Edit2,
    FileText,
    Image,
    Loader2,
    Music,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SECTION_LABELS = {
    vocabulary: 'Từ vựng',
    grammar: 'Ngữ pháp',
    reading: 'Đọc hiểu',
    listening: 'Nghe',
}

const DIFFICULTY_MAP = {
    easy: { label: 'Dễ', cls: 'bg-green-100 text-green-700' },
    medium: { label: 'Trung bình', cls: 'bg-amber-100 text-amber-700' },
    hard: { label: 'Khó', cls: 'bg-red-100 text-red-700' },
}

const OPTION_COLORS = {
    // Single neutral color for all wrong answers
    default: 'border-gray-300 bg-gray-50',
}

/**
 * Modal hiển thị chi tiết một Question Block (kèm các câu hỏi con).
 * Dùng createPortal, claymorphism design, không phụ thuộc shadcn.
 */
export default function QuestionDetailModal({
    isOpen,
    onClose,
    blockId = null,
    blockData = null,
    onEdit,
    onDelete,
}) {
    const [block, setBlock] = useState(null)
    const [loading, setLoading] = useState(false)
    const [animateIn, setAnimateIn] = useState(false)
    const [expandedQuestions, setExpandedQuestions] = useState({})
    const [aiStates, setAiStates] = useState({})
    const [confirmDeleteId, setConfirmDeleteId] = useState(null) // { [questionId]: { loading, explanation, translationVi, error } }
    const overlayRef = useRef(null)
    const user = useAuthStore(s => s.user)

    const isOwner =
        user?.role === 'admin' ||
        block?.createdBy?._id === user?._id ||
        block?.createdBy === user?._id

    // Fetch block detail if blockId is provided and no inline data
    useEffect(() => {
        if (!isOpen) return

        if (blockData) {
            setBlock(blockData)
            return
        }

        if (!blockId) return

        setLoading(true)
        questionBlockService
            .getBlockById(blockId)
            .then(res => {
                setBlock(res?.data?.block || null)
            })
            .catch(err => {
                console.error('Failed to load block detail:', err)
            })
            .finally(() => setLoading(false))
    }, [isOpen, blockId, blockData])

    // Animate in
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setAnimateIn(true))
        } else {
            setAnimateIn(false)
        }
    }, [isOpen])

    // Close on escape
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

    if (!isOpen) return null
    const handleEditBlock = () => {
        onEdit?.(block)
        onClose()
    }
    const handleDeleteQuestion = questionId => {
        setConfirmDeleteId(questionId)
    }

    const executeDeleteQuestion = async () => {
        try {
            await questionBlockService.deleteQuestion(confirmDeleteId)
            setBlock(prev => ({
                ...prev,
                questions: prev.questions.filter(q => q._id !== confirmDeleteId),
            }))
            onDelete?.()
        } catch (error) {
            console.error('Error deleting question:', error)
        }
        setConfirmDeleteId(null)
    }

    const handleEditQuestion = (questionData, blockId) => {
        onEdit?.(questionData, blockId)
        onClose()
    }

    const handleAiExplain = async q => {
        const qId = q._id
        setAiStates(prev => ({ ...prev, [qId]: { loading: true } }))
        try {
            const res = await aiService.generateExplanation({
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                level: block?.level,
                sectionType: block?.section,
                context: block?.context?.text || '',
                questionId: qId,
            })
            const data = res?.data || res
            // Update block state so explanation persists
            setBlock(prev => ({
                ...prev,
                questions: prev.questions.map(qq =>
                    qq._id === qId
                        ? {
                              ...qq,
                              explanation: data.explanation,
                              translationVi: data.translationVi,
                          }
                        : qq
                ),
            }))
            setAiStates(prev => ({ ...prev, [qId]: { loading: false, done: true } }))
        } catch (err) {
            setAiStates(prev => ({
                ...prev,
                [qId]: { loading: false, error: 'Không thể tạo giải thích' },
            }))
        }
    }

    const toggleQuestion = idx => setExpandedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }))

    const handleOverlayClick = e => {
        if (e.target === overlayRef.current) onClose?.()
    }

    const questions = block?.questions || []
    const sectionLabel = SECTION_LABELS[block?.section] || block?.section || ''
    const diff = DIFFICULTY_MAP[block?.difficulty] || DIFFICULTY_MAP.medium
    const hasContext = block?.context?.text || block?.context?.audioUrl || block?.context?.imageUrl

    return createPortal(
        <>
            <div
                ref={overlayRef}
                onClick={handleOverlayClick}
                className={cn(
                    'fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50'
                )}
                role="dialog"
                aria-modal="true"
                aria-label="Chi tiết câu hỏi"
            >
                <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-200">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b-2 border-[#E2E8F0] bg-white px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10">
                                <BookOpen className="size-4 text-[#2563EB]" />
                            </div>
                            <h2 className="truncate text-lg font-black text-[#1E293B]">
                                Chi tiết câu hỏi
                            </h2>
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

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="size-6 animate-spin text-[#2563EB]" />
                            <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && block && (
                        <div className="space-y-5 px-6 py-5">
                            {/* ── Block meta ── */}
                            <div className="space-y-3">
                                {/* Title */}
                                {(() => {
                                    const smartTitle =
                                        block.title && !block.title.startsWith('Block #')
                                            ? block.title
                                            : block.questions?.[0]?.questionText ||
                                              block.context?.text?.slice(0, 80) ||
                                              block.title
                                    return smartTitle ? (
                                        <h3 className="text-base font-bold text-[#1E293B]">
                                            {smartTitle}
                                        </h3>
                                    ) : null
                                })()}

                                {/* Tags / badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {sectionLabel && (
                                        <span className="rounded-lg bg-[#2563EB]/10 px-2.5 py-1 text-xs font-bold text-[#2563EB]">
                                            {sectionLabel}
                                        </span>
                                    )}
                                    {block.level && (
                                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                                            {block.level}
                                        </span>
                                    )}
                                    {block.questionType && (
                                        <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                                            {block.questionType}
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            'rounded-lg px-2.5 py-1 text-xs font-bold',
                                            diff.cls
                                        )}
                                    >
                                        {diff.label}
                                    </span>
                                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                                        {questions.length} câu hỏi
                                    </span>
                                </div>

                                {/* Instructions */}
                                {block.instructions && (
                                    <p className="text-sm italic text-gray-500">
                                        {block.instructions}
                                    </p>
                                )}

                                {/* Tags */}
                                {block.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {block.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500 border border-gray-200"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Context ── */}
                            {hasContext && (
                                <div
                                    className="space-y-3 rounded-2xl border-2 border-dashed border-[#2563EB]/20 bg-[#EFF6FF]/50 p-4"
                                    style={{ boxShadow: 'inset 0 2px 4px rgba(37,99,235,0.04)' }}
                                >
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
                                        <FileText className="size-4 text-[#2563EB]" />
                                        Context chung
                                    </h4>

                                    {block.context.text && (
                                        <div className="rounded-xl bg-white p-3 text-sm leading-relaxed text-[#334155] whitespace-pre-wrap border border-[#E2E8F0]">
                                            {block.context.text}
                                        </div>
                                    )}

                                    {block.context.imageUrl && (
                                        <div className="flex items-center gap-2">
                                            <Image className="size-4 text-[#94A3B8]" />
                                            <img
                                                src={block.context.imageUrl}
                                                alt="context"
                                                className="max-h-48 rounded-lg object-contain border border-[#E2E8F0]"
                                            />
                                        </div>
                                    )}

                                    {block.context.audioUrl && (
                                        <div className="flex items-center gap-2">
                                            <Music className="size-4 text-[#94A3B8]" />
                                            <audio
                                                src={block.context.audioUrl}
                                                controls
                                                className="h-9 flex-1"
                                            />
                                        </div>
                                    )}

                                    {block.context.audioScript && (
                                        <details className="text-xs text-gray-500">
                                            <summary className="cursor-pointer font-semibold hover:text-gray-700">
                                                Audio script
                                            </summary>
                                            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-2 border border-[#E2E8F0]">
                                                {block.context.audioScript}
                                            </p>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* ── Divider ── */}
                            <div className="relative py-1">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-dashed border-[#E2E8F0]" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="flex items-center gap-1.5 bg-white px-3 text-xs font-bold text-[#94A3B8]">
                                        <BookOpen className="size-3.5" />
                                        Câu hỏi ({questions.length})
                                    </span>
                                </div>
                            </div>

                            {/* ── Questions ── */}
                            <div className="space-y-3">
                                {questions.map((q, idx) => {
                                    const isExpanded = expandedQuestions[idx] !== false // default expanded
                                    const correctOpt = q.options?.find(
                                        o => o.label === q.correctAnswer
                                    )

                                    return (
                                        <div
                                            key={q._id || idx}
                                            className="overflow-hidden rounded-2xl border-2 border-[#E2E8F0] bg-white"
                                            style={{
                                                boxShadow:
                                                    '4px 4px 10px rgba(0,0,0,0.03), -2px -2px 6px rgba(255,255,255,0.5)',
                                            }}
                                        >
                                            {/* Question header */}
                                            <button
                                                type="button"
                                                onClick={() => toggleQuestion(idx)}
                                                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[#F8FAFC] cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 text-xs font-bold text-[#2563EB]">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm font-semibold text-[#1E293B] break-all line-clamp-2">
                                                        {q.questionText || `Câu ${idx + 1}`}
                                                    </span>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2 ml-2">
                                                    {q.difficulty &&
                                                        q.difficulty !== block.difficulty && (
                                                            <span
                                                                className={cn(
                                                                    'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                                                                    DIFFICULTY_MAP[q.difficulty]
                                                                        ?.cls ||
                                                                        'bg-gray-100 text-gray-500'
                                                                )}
                                                            >
                                                                {DIFFICULTY_MAP[q.difficulty]
                                                                    ?.label || q.difficulty}
                                                            </span>
                                                        )}

                                                    {/* Action buttons – owner only */}
                                                    {isOwner && (
                                                        <div className="flex items-center gap-1 ml-auto">
                                                            <button
                                                                type="button"
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    handleEditQuestion(q, block._id)
                                                                }}
                                                                className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                                                title="Sửa câu hỏi"
                                                            >
                                                                <Edit2 className="size-3.5 text-blue-600" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    handleDeleteQuestion(q._id)
                                                                }}
                                                                className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                                                title="Xóa câu hỏi"
                                                            >
                                                                <Trash2 className="size-3.5 text-red-600" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {isExpanded ? (
                                                        <ChevronUp className="size-4 text-[#94A3B8]" />
                                                    ) : (
                                                        <ChevronDown className="size-4 text-[#94A3B8]" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Question body */}
                                            {isExpanded && (
                                                <div className="space-y-3 border-t-2 border-[#E2E8F0] px-4 py-3">
                                                    {/* Question text (full) */}
                                                    <p className="text-sm leading-relaxed text-[#334155] whitespace-pre-wrap">
                                                        {q.questionText}
                                                    </p>

                                                    {/* Media */}
                                                    {(q.media?.image || q.media?.audio) && (
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            {q.media.image && (
                                                                <img
                                                                    src={q.media.image}
                                                                    alt="question"
                                                                    className="max-h-36 rounded-lg object-contain border border-[#E2E8F0]"
                                                                />
                                                            )}
                                                            {q.media.audio && (
                                                                <audio
                                                                    src={q.media.audio}
                                                                    controls
                                                                    className="h-8"
                                                                />
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Options */}
                                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                        {q.options?.map(opt => {
                                                            const isCorrect =
                                                                opt.label === q.correctAnswer
                                                            return (
                                                                <div
                                                                    key={opt.label}
                                                                    className={cn(
                                                                        'flex items-start gap-2 rounded-xl border-2 px-3 py-2 text-sm transition-all',
                                                                        isCorrect
                                                                            ? 'border-[#22C55E] bg-[#22C55E]/5'
                                                                            : 'border-gray-300 bg-gray-50'
                                                                    )}
                                                                >
                                                                    <span
                                                                        className={cn(
                                                                            'flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-black',
                                                                            isCorrect
                                                                                ? 'bg-[#22C55E] text-white'
                                                                                : 'bg-white text-[#64748B] border border-gray-300'
                                                                        )}
                                                                    >
                                                                        {isCorrect ? (
                                                                            <CheckCircle2 className="size-3.5" />
                                                                        ) : (
                                                                            opt.label
                                                                        )}
                                                                    </span>
                                                                    <span
                                                                        className={cn(
                                                                            'pt-0.5',
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

                                                    {/* Explanation & translation */}
                                                    {q.explanation || q.translationVi ? (
                                                        <div className="space-y-2 rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                                                            {q.explanation && (
                                                                <div>
                                                                    <span className="text-xs font-bold text-[#475569]">
                                                                        Giải thích:
                                                                    </span>
                                                                    <div
                                                                        className="mt-0.5 text-sm text-[#64748B] whitespace-pre-wrap [&_b]:font-bold [&_br]:block"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: q.explanation,
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {q.translationVi && (
                                                                <div>
                                                                    <span className="text-xs font-bold text-[#475569]">
                                                                        Dịch tiếng Việt:
                                                                    </span>
                                                                    <p className="mt-0.5 text-sm text-[#64748B]">
                                                                        {q.translationVi}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    handleAiExplain(q)
                                                                }}
                                                                disabled={aiStates[q._id]?.loading}
                                                                className={cn(
                                                                    'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer',
                                                                    'bg-linear-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600',
                                                                    'shadow-[0_2px_8px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_12px_rgba(139,92,246,0.35)]',
                                                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                                                )}
                                                            >
                                                                {aiStates[q._id]?.loading ? (
                                                                    <Loader2 className="size-3.5 animate-spin" />
                                                                ) : (
                                                                    <Sparkles className="size-3.5" />
                                                                )}
                                                                {aiStates[q._id]?.loading
                                                                    ? 'Đang tạo...'
                                                                    : 'AI giải thích'}
                                                            </button>
                                                            {aiStates[q._id]?.error && (
                                                                <span className="text-xs text-red-500">
                                                                    {aiStates[q._id].error}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* ── Created info ── */}
                            {block.createdBy && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-[#E2E8F0]">
                                    <span>
                                        Tạo bởi:{' '}
                                        <span className="font-semibold text-gray-500">
                                            {block.createdBy?.fullName ||
                                                block.createdBy?.email ||
                                                '—'}
                                        </span>
                                    </span>
                                    {block.createdAt && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span>
                                                {new Date(block.createdAt).toLocaleDateString(
                                                    'vi-VN',
                                                    {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !block && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FileText className="size-10 text-gray-300" />
                            <p className="mt-3 text-sm font-semibold text-gray-500">
                                Không tìm thấy dữ liệu
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="sticky bottom-0 flex justify-between items-center rounded-b-3xl border-t-2 border-[#E2E8F0] bg-white px-6 py-4">
                        {isOwner ? (
                            <button
                                type="button"
                                onClick={handleEditBlock}
                                className="h-10 rounded-xl border-2 border-blue-500 bg-blue-50 px-5 text-sm font-semibold text-blue-600 transition-all duration-200 hover:bg-blue-100 cursor-pointer"
                            >
                                Chỉnh sửa nhóm
                            </button>
                        ) : (
                            <span />
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 rounded-xl border-2 border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#475569] transition-all duration-200 hover:bg-[#F1F5F9] cursor-pointer"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={executeDeleteQuestion}
                title="Xóa câu hỏi"
                message="Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                variant="danger"
            />
        </>,
        document.body
    )
}