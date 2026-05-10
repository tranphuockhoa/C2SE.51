import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

const SECTION_LABELS = {
    vocabulary: 'Từ vựng',
    grammar: 'Ngữ pháp',
    reading: 'Đọc hiểu',
    listening: 'Nghe',
}

const DIFFICULTY_LABELS = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó',
}

function getSmartTitle(data) {
    // Skip meaningless "Block #xxx" titles from DB, prefer actual content
    if (data?.title && !data.title.startsWith('Block #')) return data.title
    if (data?.questions?.[0]?.questionText) return data.questions[0].questionText
    if (data?.context?.text)
        return data.context.text.slice(0, 80) + (data.context.text.length > 80 ? '…' : '')
    return data?.title || 'Untitled'
}

export default function QuestionCard({ className, children, data, ...props }) {
    const title = getSmartTitle(data)
    const thumbnail = data?.thumbnail || data?.context?.imageUrl
    const section = SECTION_LABELS[data?.section] || data?.category || ''
    const level = data?.level || ''
    const difficulty = DIFFICULTY_LABELS[data?.difficulty] || ''
    const questionsCount = data?.questions?.length
    const description =
        data?.description || data?.instructions || data?.questions?.[0]?.explanation || ''

    return (
        <div
            className={cn(
                'group w-full rounded-lg border-2 border-transparent bg-white shadow-sm cursor-pointer',
                'hover:border-primary',
                className
            )}
            {...props}
        >
            <div className="flex gap-4 p-3">
                <div className="relative h-20 w-17.5 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {thumbnail ? (
                        <img src={thumbnail} className="h-full w-full object-cover" alt="" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <FileText className="size-6 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="line-clamp-1 text-base sm:text-lg font-semibold text-gray-900">
                                {title}
                            </h3>

                            <p className="mt-1 line-clamp-1 text-xs sm:text-sm text-gray-500">
                                {section ? `${section} • ` : ''}
                                {difficulty || '—'} •{' '}
                                {questionsCount ? `${questionsCount} câu` : '—'}
                            </p>
                        </div>

                        {level && (
                            <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                                {level}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        {description && (
                            <p className="text-sm text-gray-600 leading-relaxed truncate">
                                {description}
                            </p>
                        )}
                        <div className="cursor-pointer">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}