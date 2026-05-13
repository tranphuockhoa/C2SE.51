import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, GripVertical, Pencil, Trash2 } from 'lucide-react'

/**
 * Compact Claymorphism card for a single question in the block builder.
 * Shows question text, options preview, correct answer, validation & meta badges.
 */
export default function QuestionItemCard({
    question,
    index,
    onEdit,
    onDelete,
    errors = [],
    dragListeners,
}) {
    const hasErrors = errors.length > 0
    const filledOptions = question.options.filter(o => o.text.trim())

    return (
        <div
            className={cn(
                'group relative rounded-2xl border-2 bg-white p-4 transition-all duration-200',
                hasErrors
                    ? 'border-red-300 bg-red-50/40 shadow-[4px_4px_12px_rgba(239,68,68,0.08)]'
                    : 'border-[#E2E8F0] hover:border-[#2563EB]/30 shadow-[4px_4px_12px_rgba(0,0,0,0.04),-2px_-2px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_16px_rgba(37,99,235,0.08),-3px_-3px_10px_rgba(255,255,255,0.9)]'
            )}
        >
            <div className="flex items-start gap-3">
                {/* Drag handle */}
                <div
                    className="mt-1 shrink-0 cursor-grab text-[#CBD5E1] active:cursor-grabbing touch-none"
                    {...(dragListeners || {})}
                >
                    <GripVertical className="size-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    {/* Number badge + question text */}
                    <div className="flex items-start gap-2.5">
                        <span
                            className={cn(
                                'shrink-0 flex size-7 items-center justify-center rounded-lg text-xs font-black',
                                hasErrors
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-[#2563EB]/10 text-[#2563EB]'
                            )}
                        >
                            {index + 1}
                        </span>
                        <p className="line-clamp-2 text-sm font-semibold text-[#1E293B] leading-relaxed">
                            {question.questionText || (
                                <span className="italic font-normal text-[#94A3B8]">
                                    Chưa nhập câu hỏi...
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Options preview chips */}
                    {filledOptions.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2 pl-9">
                            {question.options.map(opt =>
                                opt.text.trim() ? (
                                    <span
                                        key={opt.label}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors duration-150',
                                            opt.label === question.correctAnswer
                                                ? 'bg-[#22C55E]/10 font-bold text-[#16A34A] ring-1 ring-[#22C55E]/20'
                                                : 'bg-[#F1F5F9] text-[#64748B]'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-4.5 items-center justify-center rounded-md text-[10px] font-black',
                                                opt.label === question.correctAnswer
                                                    ? 'bg-[#22C55E] text-white'
                                                    : 'bg-[#CBD5E1]/60 text-[#64748B]'
                                            )}
                                        >
                                            {opt.label}
                                        </span>
                                        <span className="max-w-28 truncate">{opt.text}</span>
                                    </span>
                                ) : null
                            )}
                        </div>
                    )}

                    {/* Validation errors */}
                    {hasErrors && (
                        <div className="mt-2 space-y-0.5 pl-9">
                            {errors.map((err, i) => (
                                <p
                                    key={i}
                                    className="flex items-center gap-1.5 text-xs font-medium text-red-600"
                                >
                                    <AlertCircle className="size-3 shrink-0" />
                                    {err}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Meta badges */}
                    <div className="mt-2.5 flex items-center gap-2 pl-9">
                        {question.explanation && (
                            <span className="rounded-lg bg-[#2563EB]/8 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                                Giải thích
                            </span>
                        )}
                        {question.translationVi && (
                            <span className="rounded-lg bg-[#9333EA]/8 px-2 py-0.5 text-[10px] font-semibold text-[#9333EA]">
                                Dịch VN
                            </span>
                        )}
                        {(question.media?.image || question.media?.audio) && (
                            <span className="rounded-lg bg-[#F97316]/8 px-2 py-0.5 text-[10px] font-semibold text-[#F97316]">
                                Media
                            </span>
                        )}
                        {!hasErrors && question.questionText && filledOptions.length >= 2 && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-[#22C55E]/15">
                                <CheckCircle className="size-3.5 text-[#22C55E]" />
                            </span>
                        )}
                    </div>
                </div>

                {/* Action buttons — visible on hover */}
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={() => onEdit?.()}
                        className="rounded-xl p-2 text-[#94A3B8] transition-all duration-200 hover:bg-[#2563EB]/10 hover:text-[#2563EB] cursor-pointer"
                        aria-label={`Sửa câu ${index + 1}`}
                    >
                        <Pencil className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete?.()}
                        className="rounded-xl p-2 text-[#94A3B8] transition-all duration-200 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                        aria-label={`Xóa câu ${index + 1}`}
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}