import { cn } from '@/lib/utils'
import { questionBlockService } from '@/services/QuestionBlockService'
import {
    Check,
    ChevronDown,
    ChevronUp,
    Library,
    Loader2,
    RotateCcw,
    Search,
    Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { JLPT_SECTIONS } from './constants'

/**
 * JLPT Exam Structure by level
 * Số câu hỏi mục tiêu cho mỗi phần thi
 */
const JLPT_STRUCTURE = {
    N5: { vocabulary: 30, grammar: 25, reading: 10, listening: 30 }, // 95 câu, 105 phút
    N4: { vocabulary: 30, grammar: 25, reading: 15, listening: 30 }, // 100 câu, 125 phút
    N3: { vocabulary: 35, grammar: 25, reading: 15, listening: 30 }, // 105 câu, 140 phút
    N2: { vocabulary: 32, grammar: 22, reading: 20, listening: 33 }, // 107 câu, 155 phút
    N1: { vocabulary: 25, grammar: 20, reading: 25, listening: 33 }, // 103 câu, 170 phút
}

/**
 * Lấy nội dung preview cho block thay vì hiện ID vô nghĩa
 */
function getBlockPreview(block) {
    // Ưu tiên: title → context text → first question text
    if (block.title && !block.title.startsWith('Block #')) {
        return block.title
    }
    if (block.context?.text) {
        return block.context.text.slice(0, 80) + (block.context.text.length > 80 ? '…' : '')
    }
    if (block.questions?.length > 0) {
        const firstQ = block.questions[0].questionText || ''
        return firstQ.slice(0, 80) + (firstQ.length > 80 ? '…' : '')
    }
    return `Block ${block.questionType || 'chưa phân loại'}`
}

export default function BankSelector({ metadata, sections, setSections }) {
    const [activeSection, setActiveSection] = useState(0)
    const [blocks, setBlocks] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [expandedBlock, setExpandedBlock] = useState(null)

    const sectionConfig = JLPT_SECTIONS[activeSection]
    const section = sections[activeSection]

    /* ── Fetch blocks from bank ── */
    const fetchBlocks = useCallback(async () => {
        setLoading(true)
        try {
            const res = await questionBlockService.getBlocks({
                section: sectionConfig.type,
                level: metadata.level,
                search: search || undefined,
                limit: 50,
            })
            setBlocks(res.data || [])
        } catch {
            setBlocks([])
        } finally {
            setLoading(false)
        }
    }, [sectionConfig?.type, metadata.level, search])

    useEffect(() => {
        fetchBlocks()
    }, [fetchBlocks])

    /* ── Selected block IDs for current section ── */
    const selectedBlockIds = useMemo(
        () => new Set(section?.blocks.filter(b => b.blockId).map(b => b.blockId)),
        [section]
    )

    /* ── Selected question IDs (for individual pick) ── */
    const selectedQuestionIds = useMemo(
        () =>
            new Set(section?.blocks.filter(b => b.questionIds?.length).flatMap(b => b.questionIds)),
        [section]
    )

    /* ── Toggle entire block ── */
    const toggleBlock = useCallback(
        block => {
            setSections(prev =>
                prev.map((s, i) => {
                    if (i !== activeSection) return s
                    const exists = s.blocks.some(b => b.blockId === block._id)
                    if (exists) {
                        return {
                            ...s,
                            blocks: s.blocks.filter(b => b.blockId !== block._id),
                        }
                    }
                    return {
                        ...s,
                        blocks: [
                            ...s.blocks,
                            {
                                blockId: block._id,
                                title: block.title,
                                questionType: block.questionType,
                                order: s.blocks.length + 1,
                                pointsPerQuestion: 1,
                                // Store preview data (not sent to API, just for UI)
                                _preview: {
                                    questionCount: block.questions?.length || 0,
                                    context: block.context,
                                },
                            },
                        ],
                    }
                })
            )
        },
        [activeSection, setSections]
    )

    /* ── Toggle individual question ── */
    const toggleQuestion = useCallback(
        (blockData, questionId) => {
            setSections(prev =>
                prev.map((s, i) => {
                    if (i !== activeSection) return s

                    // Find existing entry for this type of individual pick
                    const existingIdx = s.blocks.findIndex(
                        b => b._bankBlockId === blockData._id && b.questionIds
                    )

                    if (existingIdx >= 0) {
                        const updated = [...s.blocks]
                        const entry = { ...updated[existingIdx] }
                        const ids = new Set(entry.questionIds)

                        if (ids.has(questionId)) {
                            ids.delete(questionId)
                        } else {
                            ids.add(questionId)
                        }

                        if (ids.size === 0) {
                            updated.splice(existingIdx, 1)
                        } else {
                            entry.questionIds = [...ids]
                            updated[existingIdx] = entry
                        }

                        return { ...s, blocks: updated }
                    }

                    // Create new entry
                    return {
                        ...s,
                        blocks: [
                            ...s.blocks,
                            {
                                _bankBlockId: blockData._id,
                                questionIds: [questionId],
                                title: blockData.title,
                                order: s.blocks.length + 1,
                                pointsPerQuestion: 1,
                            },
                        ],
                    }
                })
            )
        },
        [activeSection, setSections]
    )

    /* ── Count selected per section ── */
    const sectionCounts = sections.map(s =>
        s.blocks.reduce(
            (sum, b) =>
                sum + (b.blockId ? b._preview?.questionCount || 0 : b.questionIds?.length || 0),
            0
        )
    )

    /* ── Auto-generate exam based on JLPT structure ── */
    const [autoGenerating, setAutoGenerating] = useState(false)

    const autoGenerateExam = useCallback(async () => {
        setAutoGenerating(true)
        try {
            const level = metadata.level || 'N5'
            const targetCounts = JLPT_STRUCTURE[level] || JLPT_STRUCTURE.N5

            // Fetch blocks for all sections in parallel
            const sectionResults = await Promise.all(
                JLPT_SECTIONS.map(sc =>
                    questionBlockService.getBlocks({
                        section: sc.type,
                        level,
                        limit: 100,
                    })
                )
            )

            // Build auto-selected sections
            const newSections = JLPT_SECTIONS.map((sc, sectionIdx) => {
                const availableBlocks = sectionResults[sectionIdx]?.data || []
                const targetCount = targetCounts[sc.type] || 20
                const selectedBlocks = []
                let currentCount = 0

                // Shuffle blocks for randomness
                const shuffled = [...availableBlocks].sort(() => Math.random() - 0.5)

                for (const block of shuffled) {
                    if (currentCount >= targetCount) break
                    const qCount = block.questions?.length || 0
                    if (qCount === 0) continue

                    selectedBlocks.push({
                        blockId: block._id,
                        title: getBlockPreview(block),
                        questionType: block.questionType,
                        order: selectedBlocks.length + 1,
                        pointsPerQuestion: 1,
                        _preview: {
                            questionCount: qCount,
                            context: block.context,
                        },
                    })
                    currentCount += qCount
                }

                return {
                    sectionType: sc.type,
                    sectionName: sc.name,
                    duration: sc.defaultDuration,
                    order: sectionIdx + 1,
                    passingScore: 0,
                    blocks: selectedBlocks,
                }
            })

            setSections(newSections)
        } catch (err) {
            console.error('Auto-generate failed:', err)
        } finally {
            setAutoGenerating(false)
        }
    }, [metadata.level, setSections])

    const resetAll = useCallback(() => {
        setSections(
            JLPT_SECTIONS.map((sc, i) => ({
                sectionType: sc.type,
                sectionName: sc.name,
                duration: sc.defaultDuration,
                order: i + 1,
                passingScore: 0,
                blocks: [],
            }))
        )
    }, [setSections])

    const totalSelected = sectionCounts.reduce((a, b) => a + b, 0)
    const targetTotal = Object.values(JLPT_STRUCTURE[metadata.level] || JLPT_STRUCTURE.N5).reduce(
        (a, b) => a + b,
        0
    )

    return (
        <div className="space-y-4">
            {/* ── Auto-generate toolbar ── */}
            <div className="flex items-center gap-4 rounded-2xl border-2 border-[#E2E8F0] bg-linear-to-r from-[#EFF6FF] to-white p-4">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#1E293B]">
                        Tự động tạo đề theo cấu trúc JLPT {metadata.level}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                        Hệ thống sẽ tự động chọn {targetTotal} câu hỏi từ ngân hàng (Vocab:{' '}
                        {JLPT_STRUCTURE[metadata.level]?.vocabulary}, Grammar:{' '}
                        {JLPT_STRUCTURE[metadata.level]?.grammar}, Reading:{' '}
                        {JLPT_STRUCTURE[metadata.level]?.reading}, Listening:{' '}
                        {JLPT_STRUCTURE[metadata.level]?.listening})
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {totalSelected > 0 && (
                        <button
                            onClick={resetAll}
                            className="flex items-center gap-1.5 rounded-lg border-2 border-[#E2E8F0] bg-white px-3 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer transition-all"
                        >
                            <RotateCcw className="size-3.5" />
                            Xóa hết
                        </button>
                    )}
                    <button
                        onClick={autoGenerateExam}
                        disabled={autoGenerating}
                        className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 cursor-pointer transition-all"
                    >
                        {autoGenerating ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Sparkles className="size-4" />
                        )}
                        {autoGenerating ? 'Đang tạo...' : 'Tự động tạo đề'}
                    </button>
                </div>
            </div>

            {/* ── Progress indicator ── */}
            {totalSelected > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-[#F0FDF4] p-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#BBF7D0]">
                        <div
                            className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
                            style={{
                                width: `${Math.min(100, (totalSelected / targetTotal) * 100)}%`,
                            }}
                        />
                    </div>
                    <span className="text-xs font-bold text-[#22C55E]">
                        {totalSelected}/{targetTotal} câu
                    </span>
                </div>
            )}

            <div className="flex gap-6">
                {/* ── Section Tabs (left sidebar) ── */}
                <div className="w-56 shrink-0 space-y-2">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Phần thi
                    </p>
                    {JLPT_SECTIONS.map((sc, i) => (
                        <button
                            key={sc.type}
                            onClick={() => setActiveSection(i)}
                            className={cn(
                                'flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all cursor-pointer',
                                i === activeSection
                                    ? 'border-[#2563EB] bg-[#EFF6FF] shadow-sm'
                                    : 'border-transparent hover:border-[#E2E8F0] hover:bg-[#F8FAFC]'
                            )}
                        >
                            <span
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                                style={{ backgroundColor: `${sc.color}15`, color: sc.color }}
                            >
                                {sc.icon}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-[#1E293B]">
                                    {sc.name}
                                </p>
                                <p className="text-[10px] text-[#94A3B8]">
                                    {sectionCounts[i]} câu đã chọn
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* ── Bank Content (main area) ── */}
                <div className="flex-1 min-w-0">
                    {/* Search bar */}
                    <div className="mb-4 flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="h-10 w-full rounded-xl border-2 border-[#E2E8F0] pl-10 pr-3 text-sm text-[#1E293B] outline-none focus:border-[#2563EB]"
                                placeholder="Tìm kiếm trong ngân hàng câu hỏi..."
                            />
                        </div>
                        <span className="shrink-0 rounded-lg bg-[#F1F5F9] px-3 py-2 text-xs font-medium text-[#64748B]">
                            {blocks.length} blocks
                        </span>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="size-6 animate-spin text-[#2563EB]" />
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && blocks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Library className="size-10 text-[#CBD5E1]" />
                            <p className="mt-3 text-sm font-medium text-[#64748B]">
                                Không tìm thấy câu hỏi nào
                            </p>
                            <p className="text-xs text-[#94A3B8]">
                                Thử thay đổi bộ lọc hoặc thêm câu hỏi vào ngân hàng
                            </p>
                        </div>
                    )}

                    {/* Block list */}
                    {!loading && (
                        <div className="space-y-3">
                            {blocks.map(block => {
                                const isBlockSelected = selectedBlockIds.has(block._id)
                                const isExpanded = expandedBlock === block._id
                                const questionCount = block.questions?.length || 0

                                return (
                                    <div
                                        key={block._id}
                                        className={cn(
                                            'rounded-xl border-2 bg-white transition-all',
                                            isBlockSelected
                                                ? 'border-[#22C55E] shadow-sm'
                                                : 'border-[#E2E8F0]'
                                        )}
                                    >
                                        {/* Block row */}
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            {/* Select whole block */}
                                            <button
                                                onClick={() => toggleBlock(block)}
                                                className={cn(
                                                    'flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-all cursor-pointer',
                                                    isBlockSelected
                                                        ? 'border-[#22C55E] bg-[#22C55E]'
                                                        : 'border-[#CBD5E1] hover:border-[#2563EB]'
                                                )}
                                            >
                                                {isBlockSelected && (
                                                    <Check className="size-3.5 text-white" />
                                                )}
                                            </button>

                                            {/* Block info */}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-[#1E293B]">
                                                    {getBlockPreview(block)}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
                                                    <span>{block.questionType}</span>
                                                    <span>·</span>
                                                    <span>{questionCount} câu</span>
                                                    {block.difficulty && (
                                                        <>
                                                            <span>·</span>
                                                            <span>{block.difficulty}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expand to show individual questions */}
                                            <button
                                                onClick={() =>
                                                    setExpandedBlock(isExpanded ? null : block._id)
                                                }
                                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                                            >
                                                <span>Chi tiết</span>
                                                {isExpanded ? (
                                                    <ChevronUp className="size-3" />
                                                ) : (
                                                    <ChevronDown className="size-3" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Expanded: individual questions */}
                                        {isExpanded && block.questions?.length > 0 && (
                                            <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1.5">
                                                {block.context?.text && (
                                                    <div className="mb-2 rounded-lg bg-[#FFF7ED] p-2 text-xs text-[#92400E]">
                                                        <span className="font-semibold">
                                                            Context:{' '}
                                                        </span>
                                                        {block.context.text.slice(0, 200)}
                                                        {block.context.text.length > 200 && '…'}
                                                    </div>
                                                )}
                                                {block.questions.map((q, qi) => {
                                                    const isQSelected = selectedQuestionIds.has(
                                                        q._id
                                                    )
                                                    return (
                                                        <div
                                                            key={q._id}
                                                            className="flex items-start gap-2 rounded-lg bg-white p-2"
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    toggleQuestion(block, q._id)
                                                                }
                                                                className={cn(
                                                                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all cursor-pointer',
                                                                    isQSelected
                                                                        ? 'border-[#2563EB] bg-[#2563EB]'
                                                                        : 'border-[#CBD5E1] hover:border-[#2563EB]'
                                                                )}
                                                            >
                                                                {isQSelected && (
                                                                    <Check className="size-3 text-white" />
                                                                )}
                                                            </button>
                                                            <div className="min-w-0">
                                                                <p className="text-xs text-[#1E293B]">
                                                                    <span className="font-medium text-[#64748B]">
                                                                        Q{qi + 1}:{' '}
                                                                    </span>
                                                                    {q.questionText?.slice(0, 100)}
                                                                </p>
                                                                <div className="mt-0.5 flex flex-wrap gap-1">
                                                                    {q.options?.map(o => (
                                                                        <span
                                                                            key={o.label}
                                                                            className={cn(
                                                                                'rounded px-1 py-0.5 text-[10px]',
                                                                                o.label ===
                                                                                    q.correctAnswer
                                                                                    ? 'bg-[#DCFCE7] font-semibold text-[#22C55E]'
                                                                                    : 'bg-[#F1F5F9] text-[#64748B]'
                                                                            )}
                                                                        >
                                                                            {o.label}. {o.text}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}