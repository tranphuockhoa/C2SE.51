import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Download, FileText, Loader2, Upload } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { JLPT_SECTIONS } from './constants'
import { downloadExamDocxTemplate, parseExamDocx } from './exam-import-utils.js'

export default function DocxImporter({ metadata, sections, setSections }) {
    const [file, setFile] = useState(null)
    const [parsing, setParsing] = useState(false)
    const [parseResult, setParseResult] = useState(null) // { sections, errors, warnings }
    const [applied, setApplied] = useState(false)
    const fileRef = useRef(null)

    /* ── Parse file ── */
    const handleFile = useCallback(
        async e => {
            const f = e.target.files?.[0]
            if (!f) return
            setFile(f)
            setParsing(true)
            setParseResult(null)
            setApplied(false)

            try {
                const result = await parseExamDocx(f, metadata.level)
                setParseResult(result)
            } catch (err) {
                setParseResult({
                    sections: [],
                    errors: [err.message || 'Lỗi khi đọc file'],
                    warnings: [],
                })
            } finally {
                setParsing(false)
            }
        },
        [metadata.level]
    )

    /* ── Apply parsed data to sections ── */
    const handleApply = useCallback(() => {
        if (!parseResult?.sections?.length) return

        setSections(prev => {
            const updated = [...prev]
            for (const parsed of parseResult.sections) {
                const idx = updated.findIndex(s => s.sectionType === parsed.sectionType)
                if (idx >= 0) {
                    updated[idx] = {
                        ...updated[idx],
                        blocks: parsed.blocks.map((b, bi) => ({
                            _tempId: `import_${Date.now()}_${bi}`,
                            title: b.title || null,
                            questionType: b.questionType || null,
                            instruction: b.instruction || null,
                            order: bi + 1,
                            context: b.context || null,
                            questions: (b.questions || []).map((q, qi) => ({
                                _tempId: `iq_${Date.now()}_${qi}`,
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

    /* ── Count preview ── */
    const totalParsedQuestions =
        parseResult?.sections?.reduce(
            (t, s) => t + s.blocks.reduce((bt, b) => bt + (b.questions?.length || 0), 0),
            0
        ) || 0

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-[#1E293B]">Import từ file Word</h2>
                <p className="mt-1 text-sm text-[#64748B]">
                    Upload file .docx theo format đề thi JLPT
                </p>
            </div>

            {/* Template download */}
            <div className="mb-4 flex items-center justify-between rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <div className="flex items-center gap-3">
                    <FileText className="size-5 text-[#2563EB]" />
                    <div>
                        <p className="text-sm font-semibold text-[#1E293B]">Template đề thi</p>
                        <p className="text-xs text-[#64748B]">Tải mẫu file Word để điền đề thi</p>
                    </div>
                </div>
                <button
                    onClick={downloadExamDocxTemplate}
                    className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8] cursor-pointer"
                >
                    <Download className="size-3.5" />
                    Tải template
                </button>
            </div>

            {/* Upload area */}
            <div
                onClick={() => fileRef.current?.click()}
                className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors',
                    file
                        ? 'border-[#22C55E] bg-[#F0FDF4]'
                        : 'border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#EFF6FF]'
                )}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept=".docx"
                    onChange={handleFile}
                    className="hidden"
                />
                {parsing ? (
                    <Loader2 className="size-8 animate-spin text-[#2563EB]" />
                ) : file ? (
                    <>
                        <CheckCircle2 className="size-8 text-[#22C55E]" />
                        <p className="mt-2 text-sm font-semibold text-[#1E293B]">{file.name}</p>
                        <p className="text-xs text-[#64748B]">Click để chọn file khác</p>
                    </>
                ) : (
                    <>
                        <Upload className="size-8 text-[#94A3B8]" />
                        <p className="mt-2 text-sm font-medium text-[#64748B]">
                            Click hoặc kéo thả file .docx vào đây
                        </p>
                    </>
                )}
            </div>

            {/* Parse result */}
            {parseResult && (
                <div className="mt-4 space-y-3">
                    {/* Errors */}
                    {parseResult.errors?.length > 0 && (
                        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                                <AlertCircle className="size-4" />
                                Lỗi ({parseResult.errors.length})
                            </div>
                            <ul className="mt-2 space-y-1 text-xs text-red-600">
                                {parseResult.errors.map((err, i) => (
                                    <li key={i}>• {err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warnings */}
                    {parseResult.warnings?.length > 0 && (
                        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                            <p className="text-xs font-semibold text-amber-700">
                                Cảnh báo ({parseResult.warnings.length})
                            </p>
                            <ul className="mt-1 space-y-0.5 text-xs text-amber-600">
                                {parseResult.warnings.slice(0, 5).map((w, i) => (
                                    <li key={i}>• {w}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Preview summary */}
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
                                                    {sc?.name}
                                                </p>
                                                <p className="text-[10px] text-[#94A3B8]">
                                                    {s.blocks.length} blocks · {qCount} câu
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Apply button */}
                            <button
                                onClick={handleApply}
                                disabled={applied}
                                className={cn(
                                    'mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors cursor-pointer',
                                    applied
                                        ? 'bg-[#DCFCE7] text-[#22C55E]'
                                        : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
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

            {/* Format guide */}
            <div className="mt-6 rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="mb-2 text-sm font-bold text-[#1E293B]">Format file Word</p>
                <pre className="overflow-x-auto rounded-lg bg-[#1E293B] p-3 text-[10px] leading-relaxed text-[#E2E8F0]">
                    {`--- VOCABULARY ---

Q: 「先週」の読み方は？
*1: せんしゅう
2: ぜんしゅう
3: せんしゅ
4: ぜんしゅ
explanation: 先 = せん, 週 = しゅう

--- GRAMMAR ---

Q: 田中さんは毎日公園_____歩きます。
1: を
*2: で
3: に
4: から
explanation: で marks the location

--- READING ---

## Bài đọc: A Day in the Life
context: 私は今年から会社で働いています...
instruction: 読んでから問題に答えてください

Q: この人の会社は何時から何時まで？
1: 7時から5時まで
*2: 9時から5時まで
3: 8時から6時まで
4: 10時から6時まで

Q: 会社に行くために何を使う？
1: 車
*2: 電車
3: バス
4: 自転車

--- LISTENING ---

## Dialogue at a Restaurant
context: 店員: いらっしゃいませ...
audioUrl: listening_sample.mp3

Q: 何人来ましたか？
1: 1人
*2: 2人
3: 3人
4: 4人`}
                </pre>
            </div>
        </div>
    )
}