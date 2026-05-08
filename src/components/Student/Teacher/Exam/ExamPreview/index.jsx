import Modal from '@/components/ui/Modal'

export default function ExamPreview({ isOpen, onClose, exam, questions }) {
    if (!exam) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={exam.title}
            className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden pr-2">
                <div className="exam-preview-print bg-white text-gray-900">
                    <div className="text-center border-b border-gray-100 pb-3">
                        <p className="meta text-sm text-gray-500">
                            {exam.level} • {exam.totalQuestions} câu • {exam.duration}
                        </p>
                        {exam.description && (
                            <p className="text-sm text-gray-600">{exam.description}</p>
                        )}
                    </div>
                    <ol className="list-decimal space-y-4 pl-6 mt-3">
                        {questions?.length ? (
                            questions.map((q, i) => (
                                <li key={q.id} className="pb-4 border-b border-gray-100">
                                    <p className="q-title font-medium">{q.title}</p>
                                    <p className="q-meta text-gray-500">
                                        {q.category} • {q.level}
                                    </p>
                                    {q.description && (
                                        <p className="q-desc text-gray-600">{q.description}</p>
                                    )}
                                    {q.correct && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Đáp án: {q.correct}
                                        </p>
                                    )}
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-500">Chưa có câu hỏi nào.</li>
                        )}
                    </ol>
                </div>
            </div>
            <div className="shrink-0 flex justify-end gap-2 border-t border-gray-100 pt-4 mt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg w-30 border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Đóng
                </button>
            </div>
        </Modal>
    )
}