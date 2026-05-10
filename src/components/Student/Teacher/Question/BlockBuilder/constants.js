/** Constants & helpers for Question Block Builder */

export const SECTIONS = [
    { value: 'vocabulary', label: 'Từ vựng' },
    { value: 'grammar', label: 'Ngữ pháp' },
    { value: 'reading', label: 'Đọc hiểu' },
    { value: 'listening', label: 'Nghe' },
]

export const LEVELS = [
    { value: 'N5', label: 'N5' },
    { value: 'N4', label: 'N4' },
    { value: 'N3', label: 'N3' },
    { value: 'N2', label: 'N2' },
    { value: 'N1', label: 'N1' },
]

export const DIFFICULTIES = [
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' },
]

export const QUESTION_TYPES = {
    vocabulary: [
        { value: 'kanji_reading', label: 'Đọc Kanji' },
        { value: 'orthography', label: 'Chính tả' },
        { value: 'word_formation', label: 'Hình thành từ' },
        { value: 'contextual_expressions', label: 'Biểu đạt ngữ cảnh' },
        { value: 'paraphrases', label: 'Diễn đạt lại' },
        { value: 'usage', label: 'Cách dùng từ' },
    ],
    grammar: [
        { value: 'grammar_form', label: 'Ngữ pháp' },
        { value: 'sentence_composition', label: 'Sắp xếp câu' },
        { value: 'text_grammar', label: 'Ngữ pháp đoạn văn' },
    ],
    reading: [
        { value: 'short_passages', label: 'Đoạn ngắn' },
        { value: 'mid_passages', label: 'Đoạn trung bình' },
        { value: 'long_passages', label: 'Đoạn dài' },
        { value: 'integrated_reading', label: 'Đọc tổng hợp' },
        { value: 'thematic_comprehension', label: 'Đọc theo chủ đề' },
        { value: 'information_retrieval', label: 'Tìm thông tin' },
    ],
    listening: [
        { value: 'task_based', label: 'Hiểu nhiệm vụ' },
        { value: 'key_points', label: 'Nắm ý chính' },
        { value: 'general_outline', label: 'Hiểu khái quát' },
        { value: 'verbal_expressions', label: 'Biểu đạt lời nói' },
        { value: 'quick_response', label: 'Phản hồi nhanh' },
        { value: 'integrated_listening', label: 'Nghe tổng hợp' },
    ],
}

/**
 * Convert API block format to internal BlockBuilder format
 */
export function convertToBlockFormat(apiBlock) {
    return {
        _id: apiBlock._id, // Keep the original ID for updates
        _tempId: apiBlock._id, // Use _id as temp ID
        section: apiBlock.section || 'vocabulary',
        level: apiBlock.level || 'N5',
        questionType: apiBlock.questionType || '',
        title: apiBlock.title || '',
        difficulty: apiBlock.difficulty || 'medium',
        tags: apiBlock.tags || [],
        instructions: apiBlock.instructions || '',
        context: {
            text: apiBlock.context?.text || '',
            audioUrl: apiBlock.context?.audioUrl || '',
            audioScript: apiBlock.context?.audioScript || '',
            imageUrl: apiBlock.context?.imageUrl || '',
        },
        questions: (apiBlock.questions || []).map(q => ({
            _id: q._id, // Keep original question ID
            _tempId: q._id || crypto.randomUUID(),
            questionText: q.questionText || '',
            options: q.options || OPTION_LABELS.map(label => ({ label, text: '' })),
            correctAnswer: q.correctAnswer || 'A',
            explanation: q.explanation || '',
            translationVi: q.translationVi || '',
            difficulty: q.difficulty || 'medium',
            media: {
                image: q.media?.image || '',
                audio: q.media?.audio || '',
            },
        })),
    }
}

export const OPTION_LABELS = ['A', 'B', 'C', 'D']

/** Create a blank question object (for adding new questions) */
export function createBlankQuestion() {
    return {
        _tempId: crypto.randomUUID(),
        questionText: '',
        options: OPTION_LABELS.map(label => ({ label, text: '' })),
        correctAnswer: 'A',
        explanation: '',
        translationVi: '',
        difficulty: 'medium',
        media: { image: '', audio: '' },
    }
}

/** Create a blank block (for the builder) */
export function createBlankBlock() {
    return {
        _tempId: crypto.randomUUID(),
        section: 'vocabulary',
        level: 'N5',
        questionType: '',
        title: '',
        difficulty: 'medium',
        tags: [],
        instructions: '',
        context: { text: '', audioUrl: '', audioScript: '', imageUrl: '' },
        questions: [createBlankQuestion()],
    }
}

/** A block is a "group" when it has 2+ questions OR has shared context */
export function isGroupBlock(block) {
    const hasContext =
        block.context?.text ||
        block.context?.audioUrl ||
        block.context?.audioScript ||
        block.context?.imageUrl
    return block.questions.length >= 2 || !!hasContext
}

/**
 * Transform FE block state → API payload shape
 * Strips _tempId, determines group from questions count
 */
export function toApiPayload(blocks) {
    return {
        items: blocks.map(block => {
            const { _tempId, questions, context, ...rest } = block

            const hasContext =
                isGroupBlock(block) &&
                (context.text || context.audioUrl || context.audioScript || context.imageUrl)

            // Strip temp file references from context
            const cleanContext = hasContext
                ? {
                      text: context.text || undefined,
                      audioUrl: context.audioUrl || undefined,
                      audioScript: context.audioScript || undefined,
                      imageUrl: context.imageUrl || undefined,
                  }
                : undefined

            return {
                ...rest,
                context: cleanContext,
                questions: questions.map(({ _tempId: _, media, ...q }) => {
                    const cleanMedia = {
                        ...(media?.image ? { image: media.image } : {}),
                        ...(media?.audio ? { audio: media.audio } : {}),
                    }
                    const hasMedia = cleanMedia.image || cleanMedia.audio
                    return {
                        ...q,
                        ...(hasMedia ? { media: cleanMedia } : {}),
                    }
                }),
            }
        }),
    }
}

/**
 * Validate a single question — returns array of error strings
 */
export function validateQuestion(q, index) {
    const errors = []
    if (!q.questionText.trim()) {
        errors.push(`Câu ${index + 1}: Thiếu nội dung câu hỏi`)
    }
    const filledOptions = q.options.filter(o => o.text.trim())
    if (filledOptions.length < 2) {
        errors.push(`Câu ${index + 1}: Cần ít nhất 2 đáp án`)
    }
    if (!q.correctAnswer) {
        errors.push(`Câu ${index + 1}: Chưa chọn đáp án đúng`)
    }
    const correctOpt = q.options.find(o => o.label === q.correctAnswer)
    if (correctOpt && !correctOpt.text.trim()) {
        errors.push(`Câu ${index + 1}: Đáp án đúng (${q.correctAnswer}) chưa có nội dung`)
    }
    return errors
}

/**
 * Validate a full block — returns array of error strings
 */
export function validateBlock(block, blockIndex) {
    const errors = []
    const prefix = `Nhóm ${blockIndex + 1}`

    if (!block.section) errors.push(`${prefix}: Thiếu phần (section)`)
    if (!block.level) errors.push(`${prefix}: Thiếu level`)
    if (!block.questions.length) errors.push(`${prefix}: Cần ít nhất 1 câu hỏi`)

    block.questions.forEach((q, i) => {
        errors.push(...validateQuestion(q, i).map(e => `${prefix} → ${e}`))
    })

    return errors
}