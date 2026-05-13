/**
 * Constants & helpers for exam creation wizard
 */

/* ────── JLPT Section config ────── */
export const JLPT_SECTIONS = [
    {
        type: 'vocabulary',
        name: '文字・語彙 (Vocabulary)',
        icon: '文',
        color: '#22C55E',
        bgColor: '#F0FDF4',
        defaultDuration: 30,
        description: 'Kanji reading, orthography, word usage',
        blockType: 'standalone', // thường là câu đơn
    },
    {
        type: 'grammar',
        name: '文法 (Grammar)',
        icon: '文法',
        color: '#2563EB',
        bgColor: '#EFF6FF',
        defaultDuration: 35,
        description: 'Grammar form, sentence composition, text grammar',
        blockType: 'standalone',
    },
    {
        type: 'reading',
        name: '読解 (Reading)',
        icon: '読',
        color: '#F97316',
        bgColor: '#FFF7ED',
        defaultDuration: 30,
        description: 'Reading comprehension passages',
        blockType: 'group', // thường là nhóm câu hỏi
    },
    {
        type: 'listening',
        name: '聴解 (Listening)',
        icon: '聴',
        color: '#A855F7',
        bgColor: '#FAF5FF',
        defaultDuration: 35,
        description: 'Listening comprehension',
        blockType: 'group',
    },
]

/* ────── Creation method config ────── */
export const CREATION_METHODS = [
    {
        id: 'manual',
        title: 'Tạo thủ công',
        desc: 'Soạn câu hỏi trực tiếp theo từng phần thi JLPT',
        icon: 'PenLine',
        color: '#2563EB',
    },
    {
        id: 'bank',
        title: 'Từ ngân hàng câu hỏi',
        desc: 'Chọn blocks/câu hỏi có sẵn trong ngân hàng',
        icon: 'Library',
        color: '#22C55E',
    },
    {
        id: 'docx',
        title: 'Từ file Word (.docx)',
        desc: 'Import đề thi từ file Word theo format chuẩn',
        icon: 'FileText',
        color: '#F97316',
    },
    {
        id: 'json',
        title: 'Từ JSON (Dev)',
        desc: 'Dán/upload JSON cho developer hoặc quick-test',
        icon: 'Code2',
        color: '#A855F7',
        devOnly: true,
    },
]

/* ────── Wizard steps ────── */
export const WIZARD_STEPS = [
    { id: 1, label: 'Thông tin', key: 'metadata' },
    { id: 2, label: 'Phương thức', key: 'method' },
    { id: 3, label: 'Nội dung', key: 'content' },
    { id: 4, label: 'Xem trước', key: 'preview' },
]

/* ────── Default exam form data ────── */
export const DEFAULT_EXAM_FORM = {
    title: '',
    level: 'N5',
    duration: 105,
    description: '',
    instructions: '',
    passingScore: 100,
    isPublic: false,
}

/* ────── Helper: empty section template ────── */
export function createEmptySection(sectionConfig, order) {
    return {
        sectionType: sectionConfig.type,
        sectionName: sectionConfig.name,
        duration: sectionConfig.defaultDuration,
        order,
        passingScore: 0,
        blocks: [],
    }
}

/* ────── Helper: empty block template ────── */
export function createEmptyBlock(order = 1, isGroup = false) {
    return {
        _tempId: `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: '',
        questionType: '',
        instruction: '',
        order,
        context: isGroup ? { text: '' } : null,
        questions: isGroup ? [] : [createEmptyQuestion(1)],
    }
}

/* ────── Helper: empty question template ────── */
export function createEmptyQuestion(order = 1) {
    return {
        _tempId: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        questionText: '',
        options: [
            { label: '1', text: '' },
            { label: '2', text: '' },
            { label: '3', text: '' },
            { label: '4', text: '' },
        ],
        correctAnswer: '',
        explanation: '',
        translationVi: '',
        media: {},
        points: 1,
        order,
    }
}

/* ────── Helper: count total questions in sections ────── */
export function countTotalQuestions(sections) {
    return sections.reduce(
        (total, s) =>
            total +
            s.blocks.reduce((bt, b) => {
                // Manual blocks have questions array
                if (b.questions?.length) return bt + b.questions.length
                // Bank blocks (whole block) store count in _preview
                if (b.blockId) return bt + (b._preview?.questionCount || 1)
                // Bank blocks (individual questions) store questionIds
                if (b.questionIds?.length) return bt + b.questionIds.length
                return bt
            }, 0),
        0
    )
}

/* ────── Helper: build API payload from wizard state ────── */
export function buildExamPayload(metadata, sections) {
    return {
        ...metadata,
        duration: Number(metadata.duration),
        sections: sections.map(s => ({
            sectionType: s.sectionType,
            sectionName: s.sectionName,
            duration: Number(s.duration),
            order: s.order,
            passingScore: Number(s.passingScore) || 0,
            blocks: s.blocks.map(b => {
                // Từ bank — dùng blockId hoặc questionIds
                if (b.blockId)
                    return {
                        blockId: b.blockId,
                        order: b.order,
                        pointsPerQuestion: b.pointsPerQuestion,
                    }
                if (b.questionIds?.length)
                    return {
                        questionIds: b.questionIds,
                        order: b.order,
                        pointsPerQuestion: b.pointsPerQuestion,
                    }

                // Inline (manual / file / json)
                return {
                    title: b.title || null,
                    questionType: b.questionType || null,
                    instruction: b.instruction || null,
                    order: b.order,
                    context: b.context || null,
                    questions: (b.questions || []).map((q, idx) => ({
                        questionText: q.questionText,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || '',
                        translationVi: q.translationVi || '',
                        media: q.media || {},
                        points: q.points || 1,
                        order: q.order || idx + 1,
                    })),
                }
            }),
        })),
    }
}