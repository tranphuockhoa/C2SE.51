import { cn } from '@/lib/utils'
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Copy,
    Layers,
    Loader2,
    Plus,
    RotateCcw,
    Trash2,
    X,
} from 'lucide-react'
import { useCallback, useState } from 'react'

import axiosInstance from '@/services/axiosInstance'
import { questionBlockService } from '@/services/QuestionBlockService'
import BlockSettings from './BlockSettings'
import {
    convertToBlockFormat,
    createBlankBlock,
    createBlankQuestion,
    isGroupBlock,
    toApiPayload,
    validateBlock,
    validateQuestion,
} from './constants'
import QuestionEditModal from './QuestionEditModal'
import SortableQuestionItem from './SortableQuestionItem.jsx'

/* ── Section color map for block header accent ── */
const SECTION_COLORS = {
    vocabulary: { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]', border: 'border-[#F97316]/20' },
    grammar: { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/20' },
    reading: { bg: 'bg-[#2563EB]/10', text: 'text-[#2563EB]', border: 'border-[#2563EB]/20' },
    listening: { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', border: 'border-[#22C55E]/20' },
}

const SECTION_LABELS = {
    vocabulary: 'Từ vựng',
    grammar: 'Ngữ pháp',
    reading: 'Đọc hiểu',
    listening: 'Nghe',
}

/**
 * BlockBuilder — Claymorphism-styled form to create one or more question blocks.
 * Supports both create mode and edit mode.
 * Zero shadcn dependency — all native HTML + Tailwind.
 */
export default function BlockBuilder({
    editMode = false,
    initialData = null,
    onSuccess,
    onCancel,
}) {
    const [blocks, setBlocks] = useState(
        editMode && initialData ? [convertToBlockFormat(initialData)] : [createBlankBlock()]
    )
    const [collapsedBlocks, setCollapsedBlocks] = useState({})
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [errors, setErrors] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [submitResult, setSubmitResult] = useState(null)

    // ─── Block CRUD ───────────────────────────────────────
    const updateBlock = useCallback((blockIdx, updated) => {
        setBlocks(prev => prev.map((b, i) => (i === blockIdx ? updated : b)))
    }, [])

    const addBlock = () => {
        if (editMode) return // Don't allow adding blocks in edit mode
        setBlocks(prev => [...prev, createBlankBlock()])
    }

    const removeBlock = blockIdx => {
        if (editMode) return // Don't allow removing the block in edit mode
        if (blocks.length <= 1) return
        setBlocks(prev => prev.filter((_, i) => i !== blockIdx))
    }

    const duplicateBlock = blockIdx => {
        if (editMode) return // Don't allow duplicating in edit mode
        const source = blocks[blockIdx]
        const clone = {
            ...JSON.parse(JSON.stringify(source)),
            _tempId: crypto.randomUUID(),
            // Preserve File objects that JSON.stringify drops
            context: {
                ...JSON.parse(JSON.stringify(source.context || {})),
                _imageFile: source.context?._imageFile || null,
                _audioFile: source.context?._audioFile || null,
            },
            questions: source.questions.map(q => ({
                ...JSON.parse(JSON.stringify(q)),
                _tempId: crypto.randomUUID(),
                media: {
                    ...JSON.parse(JSON.stringify(q.media || {})),
                    _imageFile: q.media?._imageFile || null,
                    _audioFile: q.media?._audioFile || null,
                },
            })),
        }
        setBlocks(prev => [...prev.slice(0, blockIdx + 1), clone, ...prev.slice(blockIdx + 1)])
    }

    const toggleCollapse = blockIdx =>
        setCollapsedBlocks(prev => ({ ...prev, [blockIdx]: !prev[blockIdx] }))

    // ─── Question CRUD ───────────────────────────────────
    const addQuestion = blockIdx =>
        setBlocks(prev =>
            prev.map((b, i) =>
                i === blockIdx ? { ...b, questions: [...b.questions, createBlankQuestion()] } : b
            )
        )

    const removeQuestion = (blockIdx, qIdx) =>
        setBlocks(prev =>
            prev.map((b, i) => {
                if (i !== blockIdx) return b
                if (b.questions.length <= 1) return b
                return { ...b, questions: b.questions.filter((_, j) => j !== qIdx) }
            })
        )

    const saveQuestion = (updatedQ, updatedCtx) => {
        if (!editingQuestion) return
        const { blockIdx, questionIdx } = editingQuestion
        setBlocks(prev =>
            prev.map((b, i) => {
                if (i !== blockIdx) return b
                const nextBlock = {
                    ...b,
                    questions: b.questions.map((q, j) => (j === questionIdx ? updatedQ : q)),
                }
                if (updatedCtx) {
                    nextBlock.context = {
                        ...b.context,
                        text: updatedCtx.text ?? b.context?.text,
                        audioUrl: updatedCtx.audioUrl ?? b.context?.audioUrl,
                        _audioFile: updatedCtx._audioFile ?? b.context?._audioFile,
                        imageUrl: updatedCtx.imageUrl ?? b.context?.imageUrl,
                        _imageFile: updatedCtx._imageFile ?? b.context?._imageFile,
                    }
                }
                return nextBlock
            })
        )
        setEditingQuestion(null)
    }

    // ─── Drag & Drop ────────────────────────────────────
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = (blockIdx, event) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        setBlocks(prev =>
            prev.map((b, i) => {
                if (i !== blockIdx) return b
                const oldIndex = b.questions.findIndex(q => q._tempId === active.id)
                const newIndex = b.questions.findIndex(q => q._tempId === over.id)
                if (oldIndex === -1 || newIndex === -1) return b
                return { ...b, questions: arrayMove(b.questions, oldIndex, newIndex) }
            })
        )
    }

    // ─── Validation ──────────────────────────────────────
    const validate = () => {
        const allErrors = []
        blocks.forEach((block, i) => allErrors.push(...validateBlock(block, i)))
        setErrors(allErrors)
        return allErrors.length === 0
    }

    const getQuestionErrors = (blockIdx, qIdx) =>
        validateQuestion(blocks[blockIdx].questions[qIdx], qIdx)

    // ─── Upload pending files ────────────────────────────
    /**
     * Upload a single file to the server.
     * @param {File} file - File object
     * @param {'image'|'audio'} type - upload type
     * @returns {Promise<string>} uploaded URL
     */
    const uploadFile = async (file, type) => {
        const formData = new FormData()
        formData.append(type, file)
        const res = await axiosInstance.post(`/upload/${type}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return res.data?.data?.url || ''
    }

    /**
     * Scan all blocks/questions for pending File objects,
     * upload them in parallel, and return blocks with real URLs.
     */
    const uploadPendingFiles = async currentBlocks => {
        // Collect all upload tasks
        const tasks = []

        currentBlocks.forEach((block, bIdx) => {
            // Block context files
            if (block.context?._imageFile) {
                tasks.push({
                    type: 'context-image',
                    bIdx,
                    file: block.context._imageFile,
                })
            }
            if (block.context?._audioFile) {
                tasks.push({
                    type: 'context-audio',
                    bIdx,
                    file: block.context._audioFile,
                })
            }

            // Question media files
            block.questions.forEach((q, qIdx) => {
                if (q.media?._imageFile) {
                    tasks.push({
                        type: 'question-image',
                        bIdx,
                        qIdx,
                        file: q.media._imageFile,
                    })
                }
                if (q.media?._audioFile) {
                    tasks.push({
                        type: 'question-audio',
                        bIdx,
                        qIdx,
                        file: q.media._audioFile,
                    })
                }
            })
        })

        if (tasks.length === 0) return currentBlocks

        // Upload all in parallel
        const results = await Promise.all(
            tasks.map(async task => {
                const uploadType = task.type.includes('image') ? 'image' : 'audio'
                const url = await uploadFile(task.file, uploadType)
                return { ...task, url }
            })
        )

        // Apply URLs back into a deep-cloned blocks array
        const updated = currentBlocks.map(b => ({
            ...b,
            context: { ...b.context },
            questions: b.questions.map(q => ({
                ...q,
                media: { ...q.media },
            })),
        }))

        for (const r of results) {
            if (r.type === 'context-image') {
                // Revoke blob URL
                if (updated[r.bIdx].context._imageFile) {
                    URL.revokeObjectURL(updated[r.bIdx].context.imageUrl)
                }
                updated[r.bIdx].context.imageUrl = r.url
                updated[r.bIdx].context._imageFile = null
            } else if (r.type === 'context-audio') {
                if (updated[r.bIdx].context._audioFile) {
                    URL.revokeObjectURL(updated[r.bIdx].context.audioUrl)
                }
                updated[r.bIdx].context.audioUrl = r.url
                updated[r.bIdx].context._audioFile = null
            } else if (r.type === 'question-image') {
                if (updated[r.bIdx].questions[r.qIdx].media._imageFile) {
                    URL.revokeObjectURL(updated[r.bIdx].questions[r.qIdx].media.image)
                }
                updated[r.bIdx].questions[r.qIdx].media.image = r.url
                updated[r.bIdx].questions[r.qIdx].media._imageFile = null
            } else if (r.type === 'question-audio') {
                if (updated[r.bIdx].questions[r.qIdx].media._audioFile) {
                    URL.revokeObjectURL(updated[r.bIdx].questions[r.qIdx].media.audio)
                }
                updated[r.bIdx].questions[r.qIdx].media.audio = r.url
                updated[r.bIdx].questions[r.qIdx].media._audioFile = null
            }
        }

        return updated
    }

    // ─── Submit ──────────────────────────────────────────
    const handleSubmit = async () => {
        setSubmitResult(null)
        if (!validate()) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }
        setSubmitting(true)
        try {
            // 1. Upload all pending files first
            const blocksWithUrls = await uploadPendingFiles(blocks)

            // 2. Update state with real URLs
            setBlocks(blocksWithUrls)

            if (editMode) {
                // Edit mode: update existing block
                const blockToUpdate = blocksWithUrls[0] // Only one block in edit mode
                const updatePayload = {
                    blockId: blockToUpdate._id,
                    ...toApiPayload([blockToUpdate]).items[0], // Convert to API format
                }
                await questionBlockService.updateFullBlock(updatePayload)
            } else {
                // Create mode: create new blocks
                const payload = toApiPayload(blocksWithUrls)
                await questionBlockService.createBlocks(payload)
            }

            setSubmitResult('success')
            onSuccess?.()
        } catch (err) {
            console.error(editMode ? 'Failed to update block:' : 'Failed to create blocks:', err)
            setErrors([
                err?.response?.data?.message ||
                    err?.message ||
                    (editMode
                        ? 'Có lỗi xảy ra khi cập nhật câu hỏi'
                        : 'Có lỗi xảy ra khi tạo câu hỏi'),
            ])
            setSubmitResult('error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleReset = () => {
        setBlocks([createBlankBlock()])
        setErrors([])
        setSubmitResult(null)
        setCollapsedBlocks({})
    }

    // ─── Derived ─────────────────────────────────────────
    const totalQuestions = blocks.reduce((sum, b) => sum + b.questions.length, 0)
    const editingQ =
        editingQuestion && blocks[editingQuestion.blockIdx]?.questions[editingQuestion.questionIdx]

    return (
        <div className="mx-auto max-w-4xl space-y-5 pb-24">
            {/* ── Error banner ── */}
            {errors.length > 0 && (
                <div
                    className="rounded-2xl border-2 border-red-200 bg-red-50 p-4"
                    style={{ boxShadow: '4px 4px 12px rgba(239,68,68,0.06)' }}
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-100">
                            <AlertCircle className="size-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-red-800">
                                Vui lòng sửa các lỗi sau:
                            </p>
                            <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                                {errors.map((e, i) => (
                                    <li key={i} className="text-xs text-red-700">
                                        {e}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrors([])}
                            className="shrink-0 rounded-lg p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600 cursor-pointer"
                            aria-label="Đóng thông báo lỗi"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Success banner ── */}
            {submitResult === 'success' && (
                <div
                    className="flex items-center gap-3 rounded-2xl border-2 border-[#22C55E]/20 bg-[#22C55E]/5 p-4"
                    style={{ boxShadow: '4px 4px 12px rgba(34,197,94,0.06)' }}
                    role="status"
                >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/15">
                        <CheckCircle2 className="size-4 text-[#22C55E]" />
                    </div>
                    <p className="text-sm font-bold text-[#16A34A]">
                        Tạo thành công {blocks.length} nhóm, {totalQuestions} câu hỏi!
                    </p>
                </div>
            )}

            {/* ══════════════════════════════════════
                Block cards
            ══════════════════════════════════════ */}
            {blocks.map((block, blockIdx) => {
                const sectionColor = SECTION_COLORS[block.section] || SECTION_COLORS.vocabulary
                const isCollapsed = collapsedBlocks[blockIdx]

                return (
                    <div
                        key={block._tempId}
                        className="overflow-hidden rounded-2xl border-2 border-[#E2E8F0] bg-white"
                        style={{
                            boxShadow:
                                '6px 6px 16px rgba(0,0,0,0.05), -3px -3px 10px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.6)',
                        }}
                    >
                        {/* ── Block header ── */}
                        <div className="flex items-center justify-between border-b-2 border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 sm:px-5">
                            <button
                                type="button"
                                onClick={() => toggleCollapse(blockIdx)}
                                className="flex min-w-0 flex-1 items-center gap-2.5 cursor-pointer"
                            >
                                <div
                                    className={cn(
                                        'flex size-8 shrink-0 items-center justify-center rounded-xl',
                                        sectionColor.bg
                                    )}
                                >
                                    {isCollapsed ? (
                                        <ChevronDown className={cn('size-4', sectionColor.text)} />
                                    ) : (
                                        <ChevronUp className={cn('size-4', sectionColor.text)} />
                                    )}
                                </div>

                                <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-[#1E293B]">
                                        Nhóm {blockIdx + 1}
                                    </span>
                                    {block.title && (
                                        <span className="truncate text-sm text-[#64748B]">
                                            — {block.title}
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            'rounded-lg px-2 py-0.5 text-[10px] font-bold',
                                            sectionColor.bg,
                                            sectionColor.text
                                        )}
                                    >
                                        {SECTION_LABELS[block.section] || block.section}
                                    </span>
                                    <span className="rounded-lg bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                                        {block.level}
                                    </span>
                                    <span className="rounded-lg bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">
                                        {block.questions.length} câu
                                    </span>
                                    {isGroupBlock(block) && (
                                        <span className="rounded-lg bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                                            Nhóm
                                        </span>
                                    )}
                                </div>
                            </button>

                            <div className="flex shrink-0 items-center gap-0.5 ml-2">
                                {!editMode && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => duplicateBlock(blockIdx)}
                                            className="rounded-xl p-2 text-[#94A3B8] transition-all duration-200 hover:bg-[#2563EB]/10 hover:text-[#2563EB] cursor-pointer"
                                            title="Nhân bản nhóm"
                                            aria-label="Nhân bản nhóm"
                                        >
                                            <Copy className="size-4" />
                                        </button>
                                        {blocks.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeBlock(blockIdx)}
                                                className="rounded-xl p-2 text-[#94A3B8] transition-all duration-200 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                                                title="Xóa nhóm"
                                                aria-label="Xóa nhóm"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ── Block body ── */}
                        {!isCollapsed && (
                            <div className="p-4 sm:p-5 space-y-5">
                                <BlockSettings
                                    block={block}
                                    isGroup={isGroupBlock(block)}
                                    onChange={updated => updateBlock(blockIdx, updated)}
                                />

                                {/* Divider */}
                                <div className="relative py-1">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t-2 border-dashed border-[#E2E8F0]" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="flex items-center gap-1.5 bg-white px-3 text-xs font-bold text-[#94A3B8]">
                                            <Layers className="size-3.5" />
                                            Câu hỏi ({block.questions.length})
                                        </span>
                                    </div>
                                </div>

                                {/* Questions */}
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={e => handleDragEnd(blockIdx, e)}
                                >
                                    <SortableContext
                                        items={block.questions.map(q => q._tempId)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3">
                                            {block.questions.map((q, qIdx) => (
                                                <SortableQuestionItem
                                                    key={q._tempId}
                                                    id={q._tempId}
                                                    question={q}
                                                    index={qIdx}
                                                    errors={
                                                        errors.length > 0
                                                            ? getQuestionErrors(blockIdx, qIdx)
                                                            : []
                                                    }
                                                    onEdit={() =>
                                                        setEditingQuestion({
                                                            blockIdx,
                                                            questionIdx: qIdx,
                                                        })
                                                    }
                                                    onDelete={() => removeQuestion(blockIdx, qIdx)}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>

                                {/* Add question */}
                                <button
                                    type="button"
                                    onClick={() => addQuestion(blockIdx)}
                                    className={cn(
                                        'flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed',
                                        'border-[#CBD5E1] py-3.5 text-sm font-semibold text-[#94A3B8]',
                                        'transition-all duration-200 hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 hover:text-[#2563EB] cursor-pointer'
                                    )}
                                >
                                    <Plus className="size-4" />
                                    Thêm câu hỏi
                                </button>
                            </div>
                        )}
                    </div>
                )
            })}

            {/* ── Add block button ── */}
            {!editMode && (
                <button
                    type="button"
                    onClick={addBlock}
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed',
                        'border-[#CBD5E1] py-5 text-sm font-bold text-[#94A3B8]',
                        'transition-all duration-200 hover:border-[#F97316]/40 hover:bg-[#F97316]/5 hover:text-[#F97316] cursor-pointer'
                    )}
                >
                    <Plus className="size-5" />
                    Thêm nhóm câu hỏi mới
                </button>
            )}

            {/* ══════════════════════════════════════
                Bottom action bar — sticky
            ══════════════════════════════════════ */}
            <div
                className="sticky bottom-4 left-0 right-0 z-20 flex items-center justify-between rounded-2xl border-2 border-[#E2E8F0] bg-white/90 px-5 py-3.5 backdrop-blur-md"
                style={{
                    boxShadow:
                        '8px 8px 24px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
            >
                {/* Stats */}
                <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 font-bold text-[#1E293B]">
                        <Layers className="size-4 text-[#2563EB]" />
                        {editMode ? '1 nhóm câu hỏi' : `${blocks.length} nhóm`}
                    </span>
                    <span className="h-4 w-px bg-[#E2E8F0]" />
                    <span className="font-medium text-[#64748B]">{totalQuestions} câu hỏi</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={submitting}
                        className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[#64748B] transition-all duration-200 hover:bg-[#F1F5F9] hover:text-[#475569] disabled:opacity-50 cursor-pointer"
                    >
                        <RotateCcw className="size-3.5" />
                        <span className="hidden sm:inline">Đặt lại</span>
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={submitting}
                            className="h-9 rounded-xl border-2 border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#475569] transition-all duration-200 hover:bg-[#F1F5F9] disabled:opacity-50 cursor-pointer"
                        >
                            Hủy
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex h-10 items-center gap-2 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#EA580C] disabled:opacity-60 cursor-pointer"
                        style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }}
                        aria-busy={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                {editMode ? 'Đang cập nhật...' : 'Đang tải lên & tạo...'}
                            </>
                        ) : editMode ? (
                            'Cập nhật'
                        ) : (
                            'Tạo câu hỏi'
                        )}
                    </button>
                </div>
            </div>

            {/* ── Question Edit Modal ── */}
            <QuestionEditModal
                isOpen={!!editingQuestion}
                onClose={() => setEditingQuestion(null)}
                question={editingQ}
                onSave={saveQuestion}
                blockContext={editingQuestion ? blocks[editingQuestion.blockIdx]?.context : null}
            />
        </div>
    )
}