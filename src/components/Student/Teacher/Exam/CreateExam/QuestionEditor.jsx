import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function QuestionEditor({ question, index, onUpdate, onRemove }) {
    const [expanded, setExpanded] = useState(true)

    const handleOptionChange = (optIdx, value) => {
        onUpdate(q => ({
            ...q,
            options: q.options.map((o, i) => (i === optIdx ? { ...o, text: value } : o)),
        }))
    }

    const isValid =
        question.questionText?.trim() &&
        question.correctAnswer &&
        question.options?.some(o => o.text?.trim())

    return (
        <div
            className={cn(
                'rounded-lg border-2 transition-colors',
                isValid ? 'border-[#E2E8F0]' : 'border-[#FEE2E2]'
            )}
        >
            {/* Question header */}
            <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#F1F5F9] text-[10px] font-bold text-[#64748B]">
                        {index + 1}
                    </span>
                    <span className="truncate text-xs text-[#1E293B]">
                        {question.questionText?.slice(0, 60) || (
                            <span className="italic text-[#94A3B8]">Chưa nhập câu hỏi</span>
                        )}
                    </span>
                </div>
                <div className="ml-2 flex items-center gap-1 shrink-0">
                    {question.correctAnswer && (
                        <span className="rounded-md bg-[#DCFCE7] px-1.5 py-0.5 text-[10px] font-bold text-[#22C55E]">
                            {question.correctAnswer}
                        </span>
                    )}
                    <button
                        onClick={e => {
                            e.stopPropagation()
                            onRemove()
                        }}
                        className="rounded-md p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                        <Trash2 className="size-3" />
                    </button>
                    {expanded ? (
                        <ChevronUp className="size-3.5 text-[#94A3B8]" />
                    ) : (
                        <ChevronDown className="size-3.5 text-[#94A3B8]" />
                    )}
                </div>
            </div>

            {/* Question body */}
            {expanded && (
                <div className="space-y-3 border-t border-[#E2E8F0] p-3">
                    {/* Question Text */}
                    <textarea
                        value={question.questionText || ''}
                        onChange={e => onUpdate(q => ({ ...q, questionText: e.target.value }))}
                        rows={2}
                        className="w-full rounded-lg border-2 border-[#E2E8F0] p-2.5 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] placeholder:text-[#94A3B8]"
                        placeholder="Nhập câu hỏi..."
                    />

                    {/* Options */}
                    <div className="grid gap-2 sm:grid-cols-2">
                        {question.options?.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onUpdate(q => ({
                                            ...q,
                                            correctAnswer: opt.label,
                                        }))
                                    }
                                    className={cn(
                                        'flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer',
                                        question.correctAnswer === opt.label
                                            ? 'bg-[#22C55E] text-white shadow-sm'
                                            : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                                    )}
                                >
                                    {opt.label}
                                </button>
                                <input
                                    value={opt.text || ''}
                                    onChange={e => handleOptionChange(optIdx, e.target.value)}
                                    className="h-8 flex-1 rounded-lg border-2 border-[#E2E8F0] px-2 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] placeholder:text-[#94A3B8]"
                                    placeholder={`Đáp án ${opt.label}`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Explanation + Translation */}
                    <div className="grid gap-2 sm:grid-cols-2">
                        <input
                            value={question.explanation || ''}
                            onChange={e => onUpdate(q => ({ ...q, explanation: e.target.value }))}
                            className="h-8 rounded-lg border-2 border-[#E2E8F0] px-2.5 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] placeholder:text-[#94A3B8]"
                            placeholder="Giải thích (tùy chọn)"
                        />
                        <input
                            value={question.translationVi || ''}
                            onChange={e => onUpdate(q => ({ ...q, translationVi: e.target.value }))}
                            className="h-8 rounded-lg border-2 border-[#E2E8F0] px-2.5 text-xs text-[#1E293B] outline-none focus:border-[#2563EB] placeholder:text-[#94A3B8]"
                            placeholder="Dịch tiếng Việt (tùy chọn)"
                        />
                    </div>

                    {/* Points */}
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-medium text-[#94A3B8]">Điểm:</label>
                        <input
                            type="number"
                            min={1}
                            value={question.points || 1}
                            onChange={e =>
                                onUpdate(q => ({ ...q, points: Number(e.target.value) }))
                            }
                            className="h-6 w-12 rounded border border-[#E2E8F0] px-1 text-center text-[10px] font-medium text-[#1E293B] outline-none focus:border-[#2563EB]"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}