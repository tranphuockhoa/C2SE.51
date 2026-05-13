import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import QuestionItemCard from './QuestionItemCard'

export default function SortableQuestionItem({
    id,
    question,
    index,
    onEdit,
    onDelete,
    errors = [],
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <QuestionItemCard
                question={question}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                errors={errors}
                dragListeners={listeners}
            />
        </div>
    )
}