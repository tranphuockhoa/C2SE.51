/**
 * Exam-specific import/export utilities.
 *
 * ── DOCX format for exam ──
 * Sections are separated by:  --- VOCABULARY ---  --- GRAMMAR ---  --- READING ---  --- LISTENING ---
 *
 * Standalone questions (vocabulary, grammar):
 *   Q: question text
 *   *1: correct answer text  (asterisk marks correct)
 *   2: wrong answer text
 *   3: wrong answer text
 *   4: wrong answer text
 *   explanation: ...
 *   translation: ...
 *
 * Group questions (reading, listening):
 *   ## Block title
 *   context: passage text...
 *   instruction: ...
 *   audioUrl: ...
 *   imageUrl: ...
 *
 *   Q: question text
 *   *1: correct
 *   2: wrong
 *   ...
 *
 * ── JSON format for exam ──
 * Same structure as API payload: { sections: [ { sectionType, blocks: [ ... ] } ] }
 */

import { saveAs } from 'file-saver'
import mammoth from 'mammoth'

const SECTION_REGEX = /^---\s*(VOCABULARY|GRAMMAR|READING|LISTENING)\s*---$/i
const GROUP_HEADING_REGEX = /^##\s+(.+)$/
const QUESTION_REGEX = /^Q:\s*(.+)$/
const OPTION_REGEX = /^(\*?)(\d):\s*(.+)$/
const KV_REGEX =
    /^(explanation|translation|context|instruction|audioUrl|imageUrl|audioScript):\s*(.+)$/i

const SECTION_TYPE_MAP = {
    VOCABULARY: 'vocabulary',
    GRAMMAR: 'grammar',
    READING: 'reading',
    LISTENING: 'listening',
}

/**
 * Parse exam .docx file → { sections, errors, warnings }
 */
export async function parseExamDocx(file, defaultLevel = 'N5') {
    const arrayBuffer = await file.arrayBuffer()
    let lines
    try {
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer })
        const div = document.createElement('div')
        div.innerHTML = html
        lines = div.innerText
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean)
    } catch {
        // Fallback: file may be plain text saved with .docx extension
        const text = new TextDecoder('utf-8').decode(arrayBuffer)
        lines = text
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean)
    }

    return parseExamLines(lines, defaultLevel)
}

/**
 * Parse exam JSON text → { sections, errors, warnings }
 */
export function parseExamJSON(text) {
    const errors = []
    const warnings = []

    let data
    try {
        data = JSON.parse(text)
    } catch (e) {
        return { sections: [], errors: ['JSON không hợp lệ: ' + e.message], warnings: [] }
    }

    // Support both { sections: [...] } and direct array
    const rawSections = Array.isArray(data) ? data : data.sections
    if (!Array.isArray(rawSections) || rawSections.length === 0) {
        return { sections: [], errors: ['Không tìm thấy sections trong JSON'], warnings: [] }
    }

    const sections = rawSections.map(s => ({
        sectionType: s.sectionType,
        sectionName: s.sectionName || s.sectionType,
        duration: s.duration || 30,
        blocks: (s.blocks || []).map(b => ({
            title: b.title || null,
            questionType: b.questionType || null,
            instruction: b.instruction || null,
            context: b.context || null,
            questions: (b.questions || []).map((q, qi) => ({
                questionText: q.questionText,
                options: q.options || [],
                correctAnswer: q.correctAnswer || '',
                explanation: q.explanation || '',
                translationVi: q.translationVi || q.translation || '',
                media: q.media || {},
                points: q.points || 1,
                order: q.order || qi + 1,
            })),
        })),
    }))

    const totalQ = sections.reduce(
        (t, s) => t + s.blocks.reduce((bt, b) => bt + b.questions.length, 0),
        0
    )
    if (totalQ === 0) warnings.push('Không tìm thấy câu hỏi nào trong JSON')

    return { sections, errors, warnings }
}

/**
 * Core line parser for exam content
 */
function parseExamLines(lines, defaultLevel) {
    const errors = []
    const warnings = []
    const sections = []

    let currentSectionType = null
    let currentBlocks = []
    let currentBlock = null
    let currentQuestion = null
    let lastKvTarget = null // 'question' | 'block'

    const flushQuestion = () => {
        if (currentQuestion) {
            if (!currentQuestion.questionText) {
                warnings.push('Câu hỏi thiếu nội dung, bỏ qua')
            } else if (!currentQuestion.correctAnswer) {
                warnings.push(
                    `Câu "${currentQuestion.questionText.slice(0, 30)}..." thiếu đáp án đúng`
                )
                addQuestionToBlock()
            } else {
                addQuestionToBlock()
            }
            currentQuestion = null
        }
    }

    const addQuestionToBlock = () => {
        if (!currentBlock) {
            // Auto-create standalone block
            currentBlock = { title: null, context: null, questions: [] }
        }
        currentBlock.questions.push({ ...currentQuestion })
    }

    const flushBlock = () => {
        flushQuestion()
        if (currentBlock && currentBlock.questions.length > 0) {
            currentBlocks.push({ ...currentBlock })
        }
        currentBlock = null
    }

    const flushSection = () => {
        flushBlock()
        if (currentSectionType && currentBlocks.length > 0) {
            sections.push({
                sectionType: currentSectionType,
                sectionName: currentSectionType,
                duration: 30,
                blocks: [...currentBlocks],
            })
        }
        currentBlocks = []
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // ── Section divider ──
        const sectionMatch = line.match(SECTION_REGEX)
        if (sectionMatch) {
            flushSection()
            currentSectionType = SECTION_TYPE_MAP[sectionMatch[1].toUpperCase()]
            continue
        }

        // ── Group heading (## ...) ──
        const groupMatch = line.match(GROUP_HEADING_REGEX)
        if (groupMatch) {
            flushBlock()
            currentBlock = {
                title: groupMatch[1].trim(),
                context: null,
                instruction: null,
                questions: [],
            }
            lastKvTarget = 'block'
            continue
        }

        // ── Question line (Q: ...) ──
        const qMatch = line.match(QUESTION_REGEX)
        if (qMatch) {
            flushQuestion()
            currentQuestion = {
                questionText: qMatch[1].trim(),
                options: [],
                correctAnswer: '',
                explanation: '',
                translationVi: '',
                media: {},
                points: 1,
            }
            lastKvTarget = 'question'
            continue
        }

        // ── Option line (*1: ... or 2: ...) ──
        const optMatch = line.match(OPTION_REGEX)
        if (optMatch && currentQuestion) {
            const isCorrect = optMatch[1] === '*'
            const label = optMatch[2]
            const text = optMatch[3].trim()
            currentQuestion.options.push({ label, text })
            if (isCorrect) currentQuestion.correctAnswer = label
            continue
        }

        // ── Key-value line ──
        const kvMatch = line.match(KV_REGEX)
        if (kvMatch) {
            const key = kvMatch[1].toLowerCase()
            const value = kvMatch[2].trim()

            if (key === 'explanation' && currentQuestion) {
                currentQuestion.explanation = value
            } else if (key === 'translation' && currentQuestion) {
                currentQuestion.translationVi = value
            } else if (key === 'context') {
                if (!currentBlock) {
                    currentBlock = { title: null, context: null, questions: [] }
                }
                currentBlock.context = { text: value }
            } else if (key === 'instruction') {
                if (currentBlock) currentBlock.instruction = value
            } else if (key === 'audiourl') {
                if (currentBlock) {
                    currentBlock.context = currentBlock.context || {}
                    currentBlock.context.audioUrl = value
                }
            } else if (key === 'imageurl') {
                if (currentBlock) {
                    currentBlock.context = currentBlock.context || {}
                    currentBlock.context.imageUrl = value
                }
            } else if (key === 'audioscript') {
                if (currentBlock) {
                    currentBlock.context = currentBlock.context || {}
                    currentBlock.context.audioScript = value
                }
            }
            continue
        }

        // If we're in standalone section (vocab/grammar) and no block yet,
        // lines that don't match anything are ignored
    }

    // Final flush
    flushSection()

    if (sections.length === 0) {
        errors.push(
            'Không tìm thấy section nào. Hãy đảm bảo file có dòng --- VOCABULARY --- hoặc tương tự.'
        )
    }

    return { sections, errors, warnings }
}

/**
 * Download exam DOCX template
 */
export function downloadExamDocxTemplate() {
    const template = `--- VOCABULARY ---

Q: 「先週」の読み方は？
*1: せんしゅう
2: ぜんしゅう 
3: せんしゅ
4: ぜんしゅ
explanation: 先 = せん, 週 = しゅう
translation: Tuần trước đọc là gì?

Q: 会社は午後5時に_____です。
1: 閉めます
*2: 終わります
3: なります
4: あります

--- GRAMMAR ---

Q: 田中さんは毎日公園_____歩きます。
1: を
*2: で
3: に
4: から
explanation: で marks the location where an action takes place

Q: 私は昨年東京_____中国へ旅行しました。
*1: から
2: で
3: まで
4: に

--- READING ---

## Bài đọc: Cuộc sống hàng ngày
context: 私は今年から会社で働いています。会社は東京にあります。毎日朝7時に家を出て、電車で会社に行きます。電車は30分ぐらいかかります。
instruction: 読んでから、問題に答えてください

Q: この人の会社はどこにありますか。
1: 大阪
*2: 東京
3: 京都
4: 名古屋

Q: 電車はどのぐらいかかりますか。
1: 20分
*2: 30分
3: 40分
4: 50分

--- LISTENING ---

## Dialogue at a Restaurant  
context: 店員: いらっしゃいませ。何名様ですか？ お客さん: 2人です。
audioUrl: listening_sample.mp3

Q: 何人来ましたか。
1: 1人
*2: 2人
3: 3人
4: 4人
`

    const blob = new Blob([template], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'exam-template.txt')
}