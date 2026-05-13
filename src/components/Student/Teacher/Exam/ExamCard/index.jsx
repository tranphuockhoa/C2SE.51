import { cn } from '@/lib/utils'
import { LEVEL_COLORS } from '@/utils/helpers'
import { BookOpen, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ExamCard({ data, children, className }) {
    const navigate = useNavigate()
    if (!data) return null

    const colors = LEVEL_COLORS[data.level] || {}

    const handleCardClick = () => {
        navigate(`/creator/exam/${data._id || data.id}/questions`)
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleCardClick}
            className={cn(
                'group relative flex flex-col rounded-xl bg-white border-2 border-border p-5 hover:border-primary/50 hover:shadow-md cursor-pointer transition-all duration-200',
                className
            )}
        >
            {/* Level badge */}
            <div className="flex items-center justify-between mb-3">
                <span
                    className={`inline-flex items-center justify-center h-7 px-2.5 rounded-lg text-xs font-bold ${colors.bg || 'bg-primary/10'} ${colors.text || 'text-primary'}`}
                >
                    {data.level}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-text line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {data.title}
            </h3>

            {/* Description */}
            {data.description && (
                <p className="text-xs text-text-muted line-clamp-2 mb-3">{data.description}</p>
            )}

            {/* Meta info */}
            <div className="mt-auto flex items-center gap-4 pt-3 border-t border-border-light">
                <span className="flex items-center gap-1.5 text-xs text-text-light">
                    <Clock className="size-3.5" />
                    {typeof data.duration === 'number' ? `${data.duration} phút` : data.duration}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-text-light">
                    <BookOpen className="size-3.5" />
                    {data.totalQuestions} câu
                </span>
                {data.createdAt && (
                    <span className="ml-auto text-[10px] text-text-muted">
                        {new Date(data.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                )}
            </div>

            {/* Dropdown menu */}
            <div className="absolute right-3 top-3" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}