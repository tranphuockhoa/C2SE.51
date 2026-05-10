import { cn } from '@/lib/utils'
import { examService, questionBlockService } from '@/services'
import {
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Database,
    Edit3,
    Loader2,
    Plus,
    Search,
    X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SECTION_LABELS = {
    vocabulary: 'Từ vựng',
    grammar: 'Ngữ pháp',
    reading: 'Đọc hiểu',
    listening: 'Nghe hiểu',
}

const TABS = [
    { id: 'bank', label: 'Từ ngân hàng câu hỏi', icon: Database },
    { id: 'manual', label: 'Thêm thủ công', icon: Edit3 },
]

/**
 * Modal thêm câu hỏi vào đề thi
 *
 * - Tab 1: Chọn block/câu hỏi từ question bank
 * - Tab 2: Thêm câu hỏi thủ công (inline)
 */
export default function AddQuestionToExamModal({
    isOpen,
    onClose,
    examId,
    sectionIndex,
    sectionType,
    onSuccess,
}) {
    const [activeTab, setActiveTab] = useState('bank')
    const [animateIn, setAnimateIn] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const overlayRef = useRef(null)

    // Bank tab state
    const [blocks, setBlocks] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBlockIds, setSelectedBlockIds] = useState(new Set())
    const [expandedBlockIds, setExpandedBlockIds] = useState(new Set())
    const [bankPage, setBankPage] = useState(1)
    const [bankTotal, setBankTotal] = useState(0)

    // Manual tab state
    const [manualQuestions, setManualQuestions] = useState([createEmptyQuestion()])

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setAnimateIn(true))
            fetchBlocks()
        } else {
            setAnimateIn(false)
            setSelectedBlockIds(new Set())
            setExpandedBlockIds(new Set())
            setManualQuestions([createEmptyQuestion()])
            setSearchQuery('')
            setBankPage(1)
        }
    }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch blocks from bank
    const fetchBlocks = useCallback(
        async (page = 1, search = searchQuery) => {
            try {
                setLoading(true)
                const res = await questionBlockService.getBlocks({
                    page,
                    limit: 20,
                    search,
                    ...(sectionType ? { section: sectionType } : {}),
                })
                setBlocks(res?.data?.blocks || res?.data?.items || [])
                setBankTotal(res?.data?.total || 0)
                setBankPage(page)
            } catch (err) {
                console.error('Failed to load blocks:', err)
            } finally {
                setLoading(false)
            }
        },
        [sectionType, searchQuery]
    )

    const handleSearch = () => {
        fetchBlocks(1, searchQuery)
    }

    const toggleBlock = blockId => {
        setSelectedBlockIds(prev => {
            const next = new Set(prev)
            if (next.has(blockId)) next.delete(blockId)
            else next.add(blockId)
            return next
        })
    }

    const toggleExpand = blockId => {
        setExpandedBlockIds(prev => {
            const next = new Set(prev)
            if (next.has(blockId)) next.delete(blockId)
            else next.add(blockId)
            return next
        })
    }

    // Submit bank blocks
    const handleSubmitBank = async () => {
        if (selectedBlockIds.size === 0) return
        try {
            setSubmitting(true)
            for (const blockId of selectedBlockIds) {
                await examService.addBlockToExam({
                    examId,
                    sectionIndex,
                    block: { blockId },
                })
            }
            onSuccess?.()
            onClose()
        } catch (err) {
            console.error('Failed to add blocks:', err)
            alert('Có lỗi xảy ra khi thêm câu hỏi')
        } finally {
            setSubmitting(false)
        }
    }

    // Submit manual questions
    const handleSubmitManual = async () => {
        const valid = manualQuestions.filter(
            q => q.questionText.trim() && q.options.some(o => o.text.trim()) && q.correctAnswer
        )
        if (valid.length === 0) {
            alert('Vui lòng nhập ít nhất 1 câu hỏi hợp lệ')
            return
        }
        try {
            setSubmitting(true)
            await examService.addBlockToExam({
                examId,
                sectionIndex,
                block: {
                    title: `Câu hỏi thủ công (${new Date().toLocaleDateString('vi-VN')})`,
                    questions: valid,
                },
            })
            onSuccess?.()
            onClose()
        } catch (err) {
            console.error('Failed to add manual questions:', err)
            alert('Có lỗi xảy ra khi thêm câu hỏi')
        } finally {
            setSubmitting(false)
        }
    }

    const handleOverlayClick = e => {
        if (e.target === overlayRef.current) onClose?.()
    }

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
            <div
                className={cn(
                    'relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white transition-[opacity,transform] duration-150',
                    animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                )}
                style={{
                    border: '3px solid rgba(255,255,255,0.7)',
                    boxShadow:
                        '12px 12px 32px rgba(0,0,0,0.12), -6px -6px 16px rgba(255,255,255,0.8), inset 0 2px 0 rgba(255,255,255,0.6)',
                }}
            >
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between border-b-2 border-[#E2E8F0] bg-white px-6 py-4 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-[#2563EB]/10">
                            <Plus className="size-4 text-[#2563EB]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#1E293B]">
                                Thêm câu hỏi vào đề thi
                            </h2>
                            <p className="text-xs text-[#94A3B8]">
                                {SECTION_LABELS[sectionType] || sectionType}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="shrink-0 flex gap-1 border-b-2 border-[#E2E8F0] bg-[#F8FAFC] px-6">
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-0.5 cursor-pointer',
                                    isActive
                                        ? 'border-[#2563EB] text-[#2563EB]'
                                        : 'border-transparent text-[#94A3B8] hover:text-[#475569]'
                                )}
                            >
                                <Icon className="size-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {activeTab === 'bank' && (
                        <BankTab
                            blocks={blocks}
                            loading={loading}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onSearch={handleSearch}
                            selectedBlockIds={selectedBlockIds}
                            toggleBlock={toggleBlock}
                            expandedBlockIds={expandedBlockIds}
                            toggleExpand={toggleExpand}
                        />
                    )}
                    {activeTab === 'manual' && (
                        <ManualTab questions={manualQuestions} setQuestions={setManualQuestions} />
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex items-center justify-between rounded-b-3xl border-t-2 border-[#E2E8F0] bg-white px-6 py-4">
                    <span className="text-sm text-[#94A3B8]">
                        {activeTab === 'bank'
                            ? `Đã chọn ${selectedBlockIds.size} block`
                            : `${manualQuestions.filter(q => q.questionText.trim()).length} câu hỏi`}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 rounded-xl border-2 border-[#E2E8F0] px-5 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={activeTab === 'bank' ? handleSubmitBank : handleSubmitManual}
                            disabled={
                                submitting || (activeTab === 'bank' && selectedBlockIds.size === 0)
                            }
                            className="h-10 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="size-4 animate-spin" />}
                            Thêm vào đề thi
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

/* ── Bank Tab ── */
function BankTab({
    blocks,
    loading,
    searchQuery,
    setSearchQuery,
    onSearch,
    selectedBlockIds,
    toggleBlock,
    expandedBlockIds,
    toggleExpand,
}) {
    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSearch()}
                        placeholder="Tìm kiếm block câu hỏi..."
                        className="w-full h-10 rounded-xl border-2 border-[#E2E8F0] bg-white pl-10 pr-4 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none transition-colors"
                    />
                </div>
                <button
                    type="button"
                    onClick={onSearch}
                    className="h-10 rounded-xl bg-[#F1F5F9] px-4 text-sm font-semibold text-[#475569] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                >
                    Tìm kiếm
                </button>
            </div>

            {/* Block list */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-[#2563EB]" />
                    <span className="ml-2 text-sm text-[#94A3B8]">Đang tải...</span>
                </div>
            ) : blocks.length === 0 ? (
                <div className="text-center py-12">
                    <Database className="mx-auto size-10 text-[#E2E8F0]" />
                    <p className="mt-3 text-sm text-[#94A3B8]">Không tìm thấy block nào</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {blocks.map(block => {
                        const isSelected = selectedBlockIds.has(block._id)
                        const isExpanded = expandedBlockIds.has(block._id)
                        const qCount = block.questions?.length || block.questionCount || 0

                        return (
                            <div
                                key={block._id}
                                className={cn(
                                    'rounded-xl border-2 transition-all',
                                    isSelected
                                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                                        : 'border-[#E2E8F0] bg-white hover:border-[#94A3B8]'
                                )}
                            >
                                <div className="flex items-center gap-3 px-4 py-3">
                                    {/* Checkbox */}
                                    <button
                                        type="button"
                                        onClick={() => toggleBlock(block._id)}
                                        className={cn(
                                            'flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors cursor-pointer',
                                            isSelected
                                                ? 'border-[#2563EB] bg-[#2563EB]'
                                                : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                                        )}
                                    >
                                        {isSelected && (
                                            <CheckCircle2 className="size-4 text-white" />
                                        )}
                                    </button>

                                    {/* Content */}
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={() => toggleBlock(block._id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-[#1E293B] truncate">
                                                {block.title || `Block #${block._id?.slice(-6)}`}
                                            </h4>
                                            <span className="shrink-0 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                                                {qCount} câu
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {block.section && (
                                                <span className="rounded-md bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                                                    {SECTION_LABELS[block.section] || block.section}
                                                </span>
                                            )}
                                            {block.level && (
                                                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                                                    {block.level}
                                                </span>
                                            )}
                                            {block.difficulty && (
                                                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                                                    {block.difficulty}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expand toggle */}
                                    {qCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(block._id)}
                                            className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="size-4 text-[#94A3B8]" />
                                            ) : (
                                                <ChevronRight className="size-4 text-[#94A3B8]" />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Expanded questions */}
                                {isExpanded && block.questions?.length > 0 && (
                                    <div className="border-t border-[#E2E8F0] px-4 py-3 space-y-2">
                                        {block.questions.map((q, qi) => (
                                            <div
                                                key={q._id || qi}
                                                className="flex items-start gap-2 text-xs"
                                            >
                                                <span className="flex size-5 shrink-0 items-center justify-center rounded bg-[#F1F5F9] text-[10px] font-bold text-[#64748B]">
                                                    {qi + 1}
                                                </span>
                                                <span className="text-[#475569] line-clamp-2">
                                                    {q.questionText}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/* ── Manual Tab ── */
function ManualTab({ questions, setQuestions }) {
    const addQuestion = () => {
        setQuestions(prev => [...prev, createEmptyQuestion()])
    }

    const removeQuestion = index => {
        setQuestions(prev => prev.filter((_, i) => i !== index))
    }

    const updateQuestion = (index, field, value) => {
        setQuestions(prev => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)))
    }

    const updateOption = (qIndex, optIndex, value) => {
        setQuestions(prev =>
            prev.map((q, i) => {
                if (i !== qIndex) return q
                const newOptions = [...q.options]
                newOptions[optIndex] = { ...newOptions[optIndex], text: value }
                return { ...q, options: newOptions }
            })
        )
    }

    return (
        <div className="space-y-4">
            {questions.map((q, qi) => (
                <div
                    key={qi}
                    className="rounded-xl border-2 border-[#E2E8F0] bg-white p-4 space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#1E293B]">Câu {qi + 1}</h4>
                        {questions.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeQuestion(qi)}
                                className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                            >
                                Xóa
                            </button>
                        )}
                    </div>

                    {/* Question text */}
                    <textarea
                        value={q.questionText}
                        onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                        placeholder="Nhập nội dung câu hỏi..."
                        className="w-full h-20 rounded-xl border-2 border-[#E2E8F0] p-3 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none resize-none"
                    />

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateQuestion(qi, 'correctAnswer', opt.label)}
                                    className={cn(
                                        'flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold border-2 transition-colors cursor-pointer',
                                        q.correctAnswer === opt.label
                                            ? 'border-[#22C55E] bg-[#22C55E] text-white'
                                            : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#94A3B8]'
                                    )}
                                >
                                    {opt.label}
                                </button>
                                <input
                                    type="text"
                                    value={opt.text}
                                    onChange={e => updateOption(qi, oi, e.target.value)}
                                    placeholder={`Đáp án ${opt.label}`}
                                    className="flex-1 h-9 rounded-lg border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] placeholder:text-[#CBD5E1] focus:border-[#2563EB] focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Explanation */}
                    <input
                        type="text"
                        value={q.explanation}
                        onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                        placeholder="Giải thích (không bắt buộc)"
                        className="w-full h-9 rounded-lg border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] placeholder:text-[#CBD5E1] focus:border-[#2563EB] focus:outline-none"
                    />
                </div>
            ))}

            <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 w-full justify-center h-11 rounded-xl border-2 border-dashed border-[#CBD5E1] text-sm font-semibold text-[#94A3B8] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer"
            >
                <Plus className="size-4" />
                Thêm câu hỏi
            </button>
        </div>
    )
}

function createEmptyQuestion() {
    return {
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
    }
}