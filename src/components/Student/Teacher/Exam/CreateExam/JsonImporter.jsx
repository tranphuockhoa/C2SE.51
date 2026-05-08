import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, ClipboardPaste, Code2, Download, Upload } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { JLPT_SECTIONS } from './constants'
import { parseExamJSON } from './exam-import-utils'

export default function JsonImporter({ metadata, sections, setSections }) {
    const [jsonText, setJsonText] = useState('')
    const [parseResult, setParseResult] = useState(null)
    const [applied, setApplied] = useState(false)
    const [mode, setMode] = useState('paste') // paste | file
    const fileRef = useRef(null)

    /* ── Parse JSON text ── */
    const handleParse = useCallback(() => {
        const trimmed = jsonText.trim()
        if (!trimmed) return
        setApplied(false)
        const result = parseExamJSON(trimmed)
        setParseResult(result)
    }, [jsonText])

    /* ── Parse JSON file ── */
    const handleFile = useCallback(async e => {
        const f = e.target.files?.[0]
        if (!f) return
        const text = await f.text()
        setJsonText(text)
        setApplied(false)
        const result = parseExamJSON(text)
        setParseResult(result)
    }, [])

    /* ── Paste from clipboard ── */
    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText()
            setJsonText(text)
            setApplied(false)
            const result = parseExamJSON(text)
            setParseResult(result)
        } catch {
            // fallback - user can paste manually
        }
    }, [])

    /* ── Apply parsed data ── */
    const handleApply = useCallback(() => {
        if (!parseResult?.sections?.length) return

        setSections(prev => {
            const updated = [...prev]
            for (const parsed of parseResult.sections) {
                const idx = updated.findIndex(s => s.sectionType === parsed.sectionType)
                if (idx >= 0) {
                    updated[idx] = {
                        ...updated[idx],
                        duration: parsed.duration || updated[idx].duration,
                        blocks: parsed.blocks.map((b, bi) => ({
                            _tempId: `json_${Date.now()}_${bi}`,
                            title: b.title || null,
                            questionType: b.questionType || null,
                            instruction: b.instruction || null,
                            order: bi + 1,
                            context: b.context || null,
                            questions: (b.questions || []).map((q, qi) => ({
                                _tempId: `jq_${Date.now()}_${qi}`,
                                questionText: q.questionText,
                                options: q.options,
                                correctAnswer: q.correctAnswer,
                                explanation: q.explanation || '',
                                translationVi: q.translationVi || '',
                                media: q.media || {},
                                points: q.points || 1,
                                order: qi + 1,
                            })),
                        })),
                    }
                }
            }
            return updated
        })
        setApplied(true)
    }, [parseResult, setSections])

    /* ── Download sample JSON ── */
    const downloadSample = () => {
        const sample = {
            sections: [
                {
                    sectionType: 'vocabulary',
                    sectionName: '文字・語彙 (Vocabulary)',
                    duration: 25,
                    blocks: [
                        {
                            title: null,
                            context: null,
                            questions: [
                                {
                                    questionText: '「先週」の読み方は？',
                                    options: [
                                        { label: '1', text: 'せんしゅう' },
                                        { label: '2', text: 'ぜんしゅう' },
                                        { label: '3', text: 'せんしゅ' },
                                        { label: '4', text: 'ぜんしゅ' },
                                    ],
                                    correctAnswer: '1',
                                    explanation: '先 = せん, 週 = しゅう',
                                    points: 1,
                                },
                            ],
                        },
                    ],
                },
                {
                    sectionType: 'reading',
                    sectionName: '読解 (Reading)',
                    duration: 50,
                    blocks: [
                        {
                            title: 'Bài đọc mẫu',
                            context: { text: '私は今年から会社で働いています。' },
                            instruction: '読んでから問題に答えてください',
                            questions: [
                                {
                                    questionText: 'この人はどこで働いていますか。',
                                    options: [
                                        { label: '1', text: '学校' },
                                        { label: '2', text: '会社' },
                                        { label: '3', text: '病院' },
                                        { label: '4', text: '銀行' },
                                    ],
                                    correctAnswer: '2',
                                    points: 1,
                                },
                            ],
                        },
                    ],
                },
            ],
        }
        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'exam-sample.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    const totalParsedQuestions =
        parseResult?.sections?.reduce(
            (t, s) => t + s.blocks.reduce((bt, b) => bt + (b.questions?.length || 0), 0),
            0
        ) || 0

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-[#1E293B]">
                    Import từ JSON
                    <span className="ml-2 inline-flex items-center rounded-md bg-[#A855F7]/10 px-2 py-0.5 text-xs font-medium text-[#A855F7]">
                        DEV
                    </span>
                </h2>
                <p className="mt-1 text-sm text-[#64748B]">
                    Dán hoặc upload JSON với cấu trúc sections → blocks → questions
                </p>
            </div>

            {/* Mode tabs + template download */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1 rounded-lg bg-[#F1F5F9] p-1">
                    {[
                        { id: 'paste', label: 'Dán JSON', icon: ClipboardPaste },
                        { id: 'file', label: 'Upload file', icon: Upload },
                    ].map(m => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                                mode === m.id
                                    ? 'bg-white text-[#1E293B] shadow-sm'
                                    : 'text-[#64748B] hover:text-[#1E293B]'
                            )}
                        >
                            <m.icon className="size-3.5" />
                            {m.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={downloadSample}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:underline cursor-pointer"
                >
                    <Download className="size-3.5" />
                    Tải JSON mẫu
                </button>
            </div>

            {/* Input area */}
            {mode === 'paste' ? (
                <div className="space-y-3">
                    <div className="relative">
                        <textarea
                            value={jsonText}
                            onChange={e => {
                                setJsonText(e.target.value)
                                setParseResult(null)
                                setApplied(false)
                            }}
                            rows={14}
                            className="w-full rounded-xl border-2 border-[#E2E8F0] bg-[#1E293B] p-4 font-mono text-xs text-[#E2E8F0] outline-none focus:border-[#A855F7] placeholder:text-[#475569]"
                            placeholder='{\n  "sections": [\n    {\n      "sectionType": "vocabulary",\n      "blocks": [...]\n    }\n  ]\n}'
                        />
                        <button
                            onClick={handlePaste}
                            className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-[#334155] px-2 py-1 text-[10px] font-medium text-[#94A3B8] hover:text-white cursor-pointer"
                        >
                            <ClipboardPaste className="size-3" />
                            Paste
                        </button>
                    </div>
                    <button
                        onClick={handleParse}
                        disabled={!jsonText.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#A855F7] py-2.5 text-sm font-semibold text-white hover:bg-[#9333EA] disabled:opacity-40 cursor-pointer"
                    >
                        <Code2 className="size-4" />
                        Parse JSON
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CBD5E1] py-12 hover:border-[#A855F7] hover:bg-[#FAF5FF]"
                >
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".json"
                        onChange={handleFile}
                        className="hidden"
                    />
                    <Upload className="size-8 text-[#94A3B8]" />
                    <p className="mt-2 text-sm font-medium text-[#64748B]">
                        Click để chọn file .json
                    </p>
                </div>
            )}

            {/* Parse result */}
            {parseResult && (
                <div className="mt-4 space-y-3">
                    {parseResult.errors?.length > 0 && (
                        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                                <AlertCircle className="size-4" />
                                Lỗi
                            </div>
                            <ul className="mt-2 space-y-1 text-xs text-red-600">
                                {parseResult.errors.map((err, i) => (
                                    <li key={i}>• {err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {parseResult.warnings?.length > 0 && (
                        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3">
                            <p className="text-xs font-semibold text-amber-700">Cảnh báo</p>
                            <ul className="mt-1 space-y-0.5 text-xs text-amber-600">
                                {parseResult.warnings.map((w, i) => (
                                    <li key={i}>• {w}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {parseResult.sections?.length > 0 && (
                        <div className="rounded-xl border-2 border-[#E2E8F0] bg-white p-4">
                            <p className="mb-3 text-sm font-bold text-[#1E293B]">
                                Kết quả: {totalParsedQuestions} câu hỏi
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {parseResult.sections.map(s => {
                                    const sc = JLPT_SECTIONS.find(j => j.type === s.sectionType)
                                    const qCount = s.blocks.reduce(
                                        (t, b) => t + (b.questions?.length || 0),
                                        0
                                    )
                                    return (
                                        <div
                                            key={s.sectionType}
                                            className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] p-2"
                                        >
                                            <span
                                                className="flex size-7 items-center justify-center rounded-md text-[10px] font-bold"
                                                style={{
                                                    backgroundColor: `${sc?.color}15`,
                                                    color: sc?.color,
                                                }}
                                            >
                                                {sc?.icon}
                                            </span>
                                            <div>
                                                <p className="text-xs font-semibold text-[#1E293B]">
                                                    {sc?.name || s.sectionType}
                                                </p>
                                                <p className="text-[10px] text-[#94A3B8]">
                                                    {s.blocks.length} blocks · {qCount} câu
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <button
                                onClick={handleApply}
                                disabled={applied}
                                className={cn(
                                    'mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors cursor-pointer',
                                    applied
                                        ? 'bg-[#DCFCE7] text-[#22C55E]'
                                        : 'bg-[#A855F7] text-white hover:bg-[#9333EA]'
                                )}
                            >
                                {applied ? (
                                    <>
                                        <CheckCircle2 className="size-4" />
                                        Đã áp dụng thành công
                                    </>
                                ) : (
                                    'Áp dụng vào đề thi'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}