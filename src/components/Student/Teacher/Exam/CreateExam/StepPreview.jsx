import { cn } from '@/lib/utils'
import { BookOpen, ChevronDown, ChevronUp, Clock, FileText, Target } from 'lucide-react'
import { useState } from 'react'
import { JLPT_SECTIONS } from './constants'

/* Helper: count questions in a block (supports both manual and bank blocks) */
function getBlockQuestionCount(b) {
    if (b.questions?.length) return b.questions.length
    if (b.blockId) return b._preview?.questionCount || 1
    if (b.questionIds?.length) return b.questionIds.length
    return 0
}

export default function StepPreview({ metadata, sections, totalQuestions }) {
    const [expandedSections, setExpandedSections] = useState(new Set([0]))

    const toggleSection = idx => {
        setExpandedSections(prev => {
            const next = new Set(prev)
            next.has(idx) ? next.delete(idx) : next.add(idx)
            return next
        })
    }

    const totalPoints = sections.reduce(
        (t, s) =>
            t +
            s.blocks.reduce((bt, b) => {
                if (b.questions?.length) {
                    return bt + b.questions.reduce((qt, q) => qt + (q.points || 1), 0)
                }
                // Bank blocks: points = count * pointsPerQuestion
                return bt + getBlockQuestionCount(b) * (b.pointsPerQuestion || 1)
            }, 0),
        0
    )

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-[#1E293B]">Xem trước đề thi</h2>
                <p className="mt-1 text-sm text-[#64748B]">
                    Kiểm tra lại toàn bộ nội dung trước khi lưu
                </p>
            </div>

            {/* ── Summary card ── */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    icon={FileText}
                    label="Trình độ"
                    value={metadata.level}
                    color="#2563EB"
                />
                <SummaryCard
                    icon={BookOpen}
                    label="Tổng câu hỏi"
                    value={totalQuestions}
                    color="#22C55E"
                />
                <SummaryCard icon={Target} label="Tổng điểm" value={totalPoints} color="#F97316" />
                <SummaryCard
                    icon={Clock}
                    label="Thời gian"
                    value={`${metadata.duration} phút`}
                    color="#A855F7"
                />
            </div>

            {/* ── Exam info ── */}
            <div className="mb-6 rounded-xl border-2 border-[#E2E8F0] bg-white p-4 shadow-sm">
                <h3 className="text-base font-bold text-[#1E293B]">
                    {metadata.title || 'Chưa đặt tên'}
                </h3>
                {metadata.description && (
                    <p className="mt-1 text-sm text-[#64748B]">{metadata.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#2563EB]">
                        {metadata.level}
                    </span>
                    {metadata.isPublic && (
                        <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-medium text-[#22C55E]">
                            Công khai
                        </span>
                    )}
                </div>
            </div>

            {/* ── Sections ── */}
            <div className="space-y-3">
                {sections.map((section, sIdx) => {
                    const sc = JLPT_SECTIONS.find(j => j.type === section.sectionType)
                    const isExpanded = expandedSections.has(sIdx)
                    const qCount = section.blocks.reduce((t, b) => t + getBlockQuestionCount(b), 0)

                    // Skip empty sections
                    if (qCount === 0) return null

                    return (
                        <div
                            key={section.sectionType}
                            className="rounded-xl border-2 border-[#E2E8F0] bg-white shadow-sm overflow-hidden"
                        >
                            {/* Section header */}
                            <button
                                onClick={() => toggleSection(sIdx)}
                                className="flex w-full items-center justify-between px-4 py-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="flex size-9 items-center justify-center rounded-lg text-xs font-bold"
                                        style={{
                                            backgroundColor: `${sc?.color}15`,
                                            color: sc?.color,
                                        }}
                                    >
                                        {sc?.icon}
                                    </span>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-[#1E293B]">
                                            {sc?.name || section.sectionType}
                                        </p>
                                        <p className="text-xs text-[#94A3B8]">
                                            {section.blocks.length} nhóm · {qCount} câu ·{' '}
                                            {section.duration} phút
                                        </p>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="size-4 text-[#94A3B8]" />
                                ) : (
                                    <ChevronDown className="size-4 text-[#94A3B8]" />
                                )}
                            </button>

                            {/* Section content */}
                            {isExpanded && (
                                <div className="border-t border-[#E2E8F0] p-4 space-y-3">
                                    {section.blocks.map((block, bIdx) => (
                                        <PreviewBlock
                                            key={block._tempId || block.blockId || bIdx}
                                            block={block}
                                            blockIdx={bIdx}
                                            sectionColor={sc?.color}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Empty warning */}
            {totalQuestions === 0 && (
                <div className="mt-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
                    <p className="text-sm font-semibold text-amber-700">
                        Chưa có câu hỏi nào trong đề thi
                    </p>
                    <p className="mt-1 text-xs text-amber-600">Quay lại bước 3 để thêm nội dung</p>
                </div>
            )}
        </div>
    )
}

/* ── SummaryCard ── */
function SummaryCard({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border-2 border-[#E2E8F0] bg-white p-3 shadow-sm">
            <div
                className="flex size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon className="size-5" style={{ color }} />
            </div>
            <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">
                    {label}
                </p>
                <p className="text-base font-bold text-[#1E293B]">{value}</p>
            </div>
        </div>
    )
}

/* ── PreviewBlock ── */
function PreviewBlock({ block, blockIdx, sectionColor }) {
    const [expanded, setExpanded] = useState(false)
    const questions = block.questions || []
    const qCount = getBlockQuestionCount(block)
    const isBankBlock = !!(block.blockId || block._bankBlockId)

    // Smart title: skip "Nhóm #xxx" patterns
    const displayTitle = (() => {
        if (block.title && !block.title.startsWith('Block #')) return block.title
        if (block._preview?.context?.text)
            return (
                block._preview.context.text.slice(0, 60) +
                (block._preview.context.text.length > 60 ? '…' : '')
            )
        if (block.questionType) return block.questionType
        return `Block ${blockIdx + 1}`
    })()

    return (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <button
                onClick={() => setExpanded(e => !e)}
                className="flex w-full items-center justify-between px-3 py-2 hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className="flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: sectionColor }}
                    >
                        {blockIdx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#1E293B] truncate">
                        {displayTitle}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] shrink-0">{qCount} câu</span>
                    {isBankBlock && (
                        <span className="shrink-0 rounded bg-[#DBEAFE] px-1.5 py-0.5 text-[9px] font-medium text-[#2563EB]">
                            Ngân hàng
                        </span>
                    )}
                </div>
                {(questions.length > 0 || block._preview?.context) &&
                    (expanded ? (
                        <ChevronUp className="size-3 text-[#94A3B8] shrink-0" />
                    ) : (
                        <ChevronDown className="size-3 text-[#94A3B8] shrink-0" />
                    ))}
            </button>

            {expanded && (
                <div className="border-t border-[#E2E8F0] p-3 space-y-2">
                    {/* Context from manual blocks or bank preview */}
                    {(block.context?.text || block._preview?.context?.text) && (
                        <div className="rounded-lg bg-[#FFF7ED] p-2 text-xs text-[#92400E]">
                            <span className="font-semibold">Context: </span>
                            {(block.context?.text || block._preview?.context?.text || '').slice(
                                0,
                                300
                            )}
                            {(block.context?.text || block._preview?.context?.text || '').length >
                                300 && '…'}
                        </div>
                    )}

                    {/* Questions (manual blocks have full data) */}
                    {questions.map((q, qi) => (
                        <div key={qi} className="rounded-lg bg-white p-2.5">
                            <p className="text-xs text-[#1E293B]">
                                <span className="font-bold text-[#64748B]">Q{qi + 1}: </span>
                                {q.questionText}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                                {q.options?.map(o => (
                                    <span
                                        key={o.label}
                                        className={cn(
                                            'rounded px-1.5 py-0.5 text-[10px]',
                                            o.label === q.correctAnswer
                                                ? 'bg-[#DCFCE7] font-bold text-[#22C55E]'
                                                : 'bg-[#F1F5F9] text-[#64748B]'
                                        )}
                                    >
                                        {o.label}. {o.text}
                                    </span>
                                ))}
                            </div>
                            {q.explanation && (
                                <p className="mt-1 text-[10px] text-[#94A3B8]">
                                    💡 {q.explanation}
                                </p>
                            )}
                        </div>
                    ))}

                    {/* Bank blocks without full question data */}
                    {isBankBlock && questions.length === 0 && (
                        <div className="rounded-lg bg-[#EFF6FF] p-2.5 text-xs text-[#2563EB]">
                            📦 Đã chọn {qCount} câu hỏi từ ngân hàng
                            {block.questionType && (
                                <span className="ml-1 text-[#64748B]">· {block.questionType}</span>
                            )}
                            {block.questionIds?.length > 0 && (
                                <span className="ml-1 text-[#64748B]">
                                    · {block.questionIds.length} câu riêng lẻ
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}