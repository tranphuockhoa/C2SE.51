import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Eye, PlusIcon, Search } from 'lucide-react'

const LEVEL_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'vocabulary', label: 'Từ vựng' },
    { value: 'grammar', label: 'Ngữ pháp' },
    { value: 'reading', label: 'Đọc hiểu' },
    { value: 'listening', label: 'Nghe' },
    { value: 'speaking', label: 'Nói' },
]

export default function ExamQuestionHeading({
    exam,
    setIsOpen,
    onPreview,
    selectedSkill = 'all',
    onSkillChange,
}) {
    return (
        <div className="flex flex-col gap-4">
            {/* Header text */}
            <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    Quay lại đề thi - Danh sách câu hỏi - {exam.title}
                </h1>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                    {exam.level} • {exam.totalQuestions} câu • {exam.duration} - {exam.description}
                </p>
            </div>

            {/* Action row */}
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        aria-label="Tìm kiếm câu hỏi"
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                    <div className="w-full sm:w-50">
                        <Select value={selectedSkill} onValueChange={v => onSkillChange?.(v)}>
                            <SelectTrigger className="h-10 w-full rounded-lg border border-gray-300 px-3">
                                <SelectValue placeholder="Theo kĩ năng" />
                            </SelectTrigger>
                            <SelectContent>
                                {LEVEL_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <button
                        type="button"
                        onClick={onPreview}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-black transition hover:bg-gray-50 sm:w-auto"
                    >
                        <Eye className="h-4 w-4 shrink-0" />
                        <span>Xem trước đề thi</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-black transition hover:bg-gray-50 sm:w-auto"
                    >
                        <PlusIcon className="h-4 w-4 shrink-0" />
                        <span>Thêm câu hỏi</span>
                    </button>
                </div>
            </div>
        </div>
    )
}