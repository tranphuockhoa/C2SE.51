import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { createEmptyBlock, createEmptyQuestion, JLPT_SECTIONS } from './constants'
import QuestionEditor from './QuestionEditor.jsx'

export default function ManualBuilder({ metadata, sections, setSections }) {
    const [activeSection, setActiveSection] = useState(0)

    const section = sections[activeSection]
    const sectionConfig = JLPT_SECTIONS[activeSection]

    /* ── section-level helpers ── */
    const updateSection = useCallback(
        (sectionIdx, updater) => {
            setSections(prev => prev.map((s, i) => (i === sectionIdx ? updater(s) : s)))
        },
        [setSections]
    )

    const addBlock = useCallback(() => {
        const isGroup = sectionConfig?.blockType === 'group'
        updateSection(activeSection, s => ({
            ...s,
            blocks: [...s.blocks, createEmptyBlock(s.blocks.length + 1, isGroup)],
        }))
    }, [activeSection, sectionConfig, updateSection])

    const removeBlock = useCallback(
        blockIdx => {
            updateSection(activeSection, s => ({
                ...s,
                blocks: s.blocks
                    .filter((_, i) => i !== blockIdx)
                    .map((b, i) => ({ ...b, order: i + 1 })),
            }))
        },
        [activeSection, updateSection]
    )

    const updateBlock = useCallback(
        (blockIdx, updater) => {
            updateSection(activeSection, s => ({
                ...s,
                blocks: s.blocks.map((b, i) => (i === blockIdx ? updater(b) : b)),
            }))
        },
        [activeSection, updateSection]
    )

    /* ── question count per section ── */
    const sectionCounts = sections.map(s =>
        s.blocks.reduce((sum, b) => sum + (b.questions?.length || 0), 0)
    )

    return (
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
                                {sectionCounts[i]} câu · {sections[i].blocks.length} block
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* ── Section Content (main area) ── */}
            <div className="flex-1 min-w-0">
                {/* Section Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span
                            className="flex size-10 items-center justify-center rounded-xl text-sm font-bold"
                            style={{
                                backgroundColor: `${sectionConfig?.color}15`,
                                color: sectionConfig?.color,
                            }}
                        >
                            {sectionConfig?.icon}
                        </span>
                        <div>
                            <h3 className="text-base font-bold text-[#1E293B]">
                                {sectionConfig?.name}
                            </h3>
                            <p className="text-xs text-[#64748B]">
                                {sectionConfig?.description} ·{' '}
                                <span className="font-medium">
                                    {sectionCounts[activeSection]} câu hỏi
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Section duration */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-[#64748B]">Thời gian:</label>
                        <input
                            type="number"
                            min={1}
                            value={section?.duration || 0}
                            onChange={e =>
                                updateSection(activeSection, s => ({
                                    ...s,
                                    duration: Number(e.target.value),
                                }))
                            }
                            className="h-8 w-16 rounded-lg border-2 border-[#E2E8F0] px-2 text-center text-xs font-medium text-[#1E293B] outline-none focus:border-[#2563EB]"
                        />
                        <span className="text-xs text-[#94A3B8]">phút</span>
                    </div>
                </div>

                {/* Blocks */}
                <div className="space-y-4">
                    {section?.blocks.map((block, blockIdx) => (
                        <BlockEditor
                            key={block._tempId || blockIdx}
                            block={block}
                            blockIdx={blockIdx}
                            isGroup={sectionConfig?.blockType === 'group'}
                            sectionColor={sectionConfig?.color}
                            onUpdate={updater => updateBlock(blockIdx, updater)}
                            onRemove={() => removeBlock(blockIdx)}
                        />
                    ))}
                </div>

                {/* Add Block button */}
                <button
                    onClick={addBlock}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] py-3 text-sm font-medium text-[#64748B] transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] cursor-pointer"
                >
                    <Plus className="size-4" />
                    {sectionConfig?.blockType === 'group' ? 'Thêm nhóm câu hỏi' : 'Thêm câu hỏi'}
                </button>
            </div>
        </div>
    )
}

/* ════════════════════════════ BlockEditor ════════════════════════════ */

function BlockEditor({ block, blockIdx, isGroup, sectionColor, onUpdate, onRemove }) {
    const [collapsed, setCollapsed] = useState(false)

    const addQuestion = () => {
        onUpdate(b => ({
            ...b,
            questions: [
                ...(b.questions || []),
                createEmptyQuestion((b.questions?.length || 0) + 1),
            ],
        }))
    }

    const removeQuestion = qIdx => {
        onUpdate(b => ({
            ...b,
            questions: b.questions
                .filter((_, i) => i !== qIdx)
                .map((q, i) => ({ ...q, order: i + 1 })),
        }))
    }

    const updateQuestion = (qIdx, updater) => {
        onUpdate(b => ({
            ...b,
            questions: b.questions.map((q, i) => (i === qIdx ? updater(q) : q)),
        }))
    }

    const questionCount = block.questions?.length || 0

    return (
        <div className="rounded-xl border-2 border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
            {/* Block header */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                onClick={() => setCollapsed(c => !c)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <GripVertical className="size-4 shrink-0 text-[#CBD5E1]" />
                    <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                        style={{ backgroundColor: sectionColor }}
                    >
                        {blockIdx + 1}
                    </span>
                    {isGroup ? (
                        <input
                            value={block.title || ''}
                            onChange={e => {
                                e.stopPropagation()
                                onUpdate(b => ({ ...b, title: e.target.value }))
                            }}
                            onClick={e => e.stopPropagation()}
                            className="min-w-0 flex-1 rounded-md border-0 bg-transparent px-1 text-sm font-semibold text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:bg-[#F1F5F9]"
                            placeholder="Tên nhóm câu hỏi..."
                        />
                    ) : (
                        <span className="text-sm font-semibold text-[#1E293B]">
                            Câu hỏi {blockIdx + 1}
                        </span>
                    )}
                    <span className="ml-auto shrink-0 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#64748B]">
                        {questionCount} câu
                    </span>
                </div>
                <div className="ml-2 flex items-center gap-1">
                    <button
                        onClick={e => {
                            e.stopPropagation()
                            onRemove()
                        }}
                        className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                    {collapsed ? (
                        <ChevronDown className="size-4 text-[#94A3B8]" />
                    ) : (
                        <ChevronUp className="size-4 text-[#94A3B8]" />
                    )}
                </div>
            </div>

            {/* Block body */}
            {!collapsed && (
                <div className="border-t border-[#E2E8F0] p-4 space-y-4">
                    {/* Context (for group blocks) */}
                    {isGroup && (
                        <div className="space-y-3 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                                Nội dung chung (context)
                            </p>
                            <textarea
                                value={block.context?.text || ''}
                                onChange={e =>
                                    onUpdate(b => ({
                                        ...b,
                                        context: { ...b.context, text: e.target.value },
                                    }))
                                }
                                rows={4}
                                className="w-full rounded-lg border-2 border-[#E2E8F0] bg-white p-3 text-sm text-[#1E293B] outline-none focus:border-[#2563EB]"
                                placeholder="Nhập đoạn văn đọc hiểu, transcript bài nghe, hoặc tình huống..."
                            />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <input
                                    value={block.context?.audioUrl || ''}
                                    onChange={e =>
                                        onUpdate(b => ({
                                            ...b,
                                            context: { ...b.context, audioUrl: e.target.value },
                                        }))
                                    }
                                    className="h-9 rounded-lg border-2 border-[#E2E8F0] bg-white px-3 text-xs text-[#1E293B] outline-none focus:border-[#2563EB]"
                                    placeholder="URL audio (nếu có)"
                                />
                                <input
                                    value={block.context?.imageUrl || ''}
                                    onChange={e =>
                                        onUpdate(b => ({
                                            ...b,
                                            context: { ...b.context, imageUrl: e.target.value },
                                        }))
                                    }
                                    className="h-9 rounded-lg border-2 border-[#E2E8F0] bg-white px-3 text-xs text-[#1E293B] outline-none focus:border-[#2563EB]"
                                    placeholder="URL hình ảnh (nếu có)"
                                />
                            </div>
                        </div>
                    )}

                    {/* Questions */}
                    <div className="space-y-3">
                        {block.questions?.map((q, qIdx) => (
                            <QuestionEditor
                                key={q._tempId || qIdx}
                                question={q}
                                index={qIdx}
                                onUpdate={updater => updateQuestion(qIdx, updater)}
                                onRemove={() => removeQuestion(qIdx)}
                            />
                        ))}
                    </div>

                    {/* Add question (for group blocks, or standalone to add another) */}
                    <button
                        onClick={addQuestion}
                        className="flex w-full items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#E2E8F0] py-2 text-xs font-medium text-[#94A3B8] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] cursor-pointer"
                    >
                        <Plus className="size-3" />
                        Thêm câu hỏi
                    </button>
                </div>
            )}
        </div>
    )
}