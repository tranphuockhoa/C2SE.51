import { cn } from '@/lib/utils'

export default function QuestionDisplayCard({ className, children, data, ...props }) {
    // Get the section type color
    const getSectionColor = sectionType => {
        switch (sectionType) {
            case 'vocabulary':
                return 'bg-blue-100 text-blue-800'
            case 'grammar':
                return 'bg-green-100 text-green-800'
            case 'reading':
                return 'bg-yellow-100 text-yellow-800'
            case 'listening':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Get section type Vietnamese name
    const getSectionName = sectionType => {
        switch (sectionType) {
            case 'vocabulary':
                return 'Từ vựng'
            case 'grammar':
                return 'Ngữ pháp'
            case 'reading':
                return 'Đọc hiểu'
            case 'listening':
                return 'Nghe hiểu'
            default:
                return sectionType
        }
    }

    return (
        <div
            className={cn(
                'group w-full rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200',
                className
            )}
            {...props}
        >
            <div className="p-4">
                {/* Header with section type and actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getSectionColor(data?.sectionType)}`}
                        >
                            {getSectionName(data?.sectionType)}
                        </span>
                        {data?.points && (
                            <span className="text-xs text-gray-500">{data.points} điểm</span>
                        )}
                    </div>
                    <div onClick={e => e.stopPropagation()}>{children}</div>
                </div>

                {/* Question content */}
                <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                        {data?.questionText || 'Câu hỏi không có nội dung'}
                    </h3>

                    {/* Options preview */}
                    {data?.options && data.options.length > 0 && (
                        <div className="space-y-1">
                            {data.options.slice(0, 2).map((option, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 text-xs text-gray-600"
                                >
                                    <span
                                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium ${
                                            option.label === data.correctAnswer
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {option.label}
                                    </span>
                                    <span className="line-clamp-1">{option.text}</span>
                                </div>
                            ))}
                            {data.options.length > 2 && (
                                <div className="text-xs text-gray-400">
                                    +{data.options.length - 2} đáp án khác...
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>
                        Đáp án:{' '}
                        <span className="font-medium text-green-600">{data?.correctAnswer}</span>
                    </span>
                    {data?.order && <span>Thứ tự: {data.order}</span>}
                </div>

                {/* Explanation preview */}
                {data?.explanation && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-600 line-clamp-1">
                            <span className="font-medium">Giải thích:</span>{' '}
                            <span dangerouslySetInnerHTML={{ __html: data.explanation }} />
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}