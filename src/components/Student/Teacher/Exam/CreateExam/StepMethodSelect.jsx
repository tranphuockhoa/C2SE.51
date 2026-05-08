import { cn } from '@/lib/utils'
import { Code2, FileText, Library, PenLine } from 'lucide-react'
import { CREATION_METHODS } from './constants'

const ICONS = { PenLine, Library, FileText, Code2 }

export default function StepMethodSelect({ method, setMethod }) {
    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
                <h2 className="text-xl font-bold text-[#1E293B]">Chọn phương thức tạo đề thi</h2>
                <p className="mt-1 text-sm text-[#64748B]">Chọn cách bạn muốn tạo đề thi JLPT</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {CREATION_METHODS.map(m => {
                    const Icon = ICONS[m.icon]
                    const isSelected = method === m.id

                    return (
                        <button
                            key={m.id}
                            onClick={() => setMethod(m.id)}
                            className={cn(
                                'group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-all cursor-pointer',
                                isSelected
                                    ? 'border-[#2563EB] bg-[#EFF6FF] shadow-lg shadow-[#2563EB]/10'
                                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-md'
                            )}
                        >
                            {/* Icon */}
                            <div
                                className="flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                                style={{ backgroundColor: `${m.color}15` }}
                            >
                                {Icon && <Icon className="size-6" style={{ color: m.color }} />}
                            </div>

                            {/* Text */}
                            <div>
                                <h3 className="text-sm font-bold text-[#1E293B]">
                                    {m.title}
                                    {m.devOnly && (
                                        <span className="ml-2 inline-flex items-center rounded-md bg-[#A855F7]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#A855F7]">
                                            DEV
                                        </span>
                                    )}
                                </h3>
                                <p className="mt-1 text-xs text-[#64748B]">{m.desc}</p>
                            </div>

                            {/* Selected indicator */}
                            {isSelected && (
                                <div className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-[#2563EB]">
                                    <svg
                                        className="size-3.5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}