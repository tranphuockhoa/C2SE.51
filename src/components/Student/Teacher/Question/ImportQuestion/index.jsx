import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ClipboardPaste,
    Code2,
    Download,
    FileSpreadsheet,
    FileText,
    Loader2,
    Upload,
    X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
    downloadExcelTemplate,
    downloadJSONTemplate,
    downloadWordTemplate,
    parseExcel,
    parseJSON,
    parseJSONText,
    parseWord,
} from './import-utils'

/* ────── Tab configuration ────── */
const TABS = [
    {
        id: 'excel',
        label: 'Excel',
        icon: FileSpreadsheet,
        accept: '.xlsx,.xls',
        color: '#22C55E',
        desc: 'Hỗ trợ .xlsx, .xls',
        downloadTemplate: downloadExcelTemplate,
    },
    {
        id: 'word',
        label: 'Word',
        icon: FileText,
        accept: '.docx',
        color: '#2563EB',
        desc: 'Hỗ trợ .docx',
        downloadTemplate: downloadWordTemplate,
    },
    {
        id: 'json',
        label: 'JSON',
        icon: Code2,
        accept: '.json',
        color: '#F97316',
        desc: 'Dành cho developer / quick-test',
        downloadTemplate: downloadJSONTemplate,
    },
]

const PARSERS = {
    excel: parseExcel,
    word: parseWord,
    json: parseJSON,
}

/* ────── Preview sub-components ────── */
function PreviewItem({ item, index }) {
    const [open, setOpen] = useState(false)
    const isGroup = item.questions?.length > 1
    return (
        <div className="rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between px-3 py-2 text-left cursor-pointer hover:bg-[#F1F5F9] transition-colors"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className={`inline-flex shrink-0 items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${isGroup ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[#FEF3C7] text-[#D97706]'}`}
                    >
                        {isGroup ? 'Nhóm' : 'Đơn'}
                    </span>
                    <span className="truncate text-xs font-semibold text-[#334155]">
                        {item.title ||
                            item.questions?.[0]?.questionText?.slice(0, 50) ||
                            `Nhóm ${index + 1}`}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-[#94A3B8]">
                        {item.section} · {item.level} · {item.questions?.length || 0} câu
                    </span>
                    {open ? (
                        <ChevronUp className="size-3.5 text-[#94A3B8]" />
                    ) : (
                        <ChevronDown className="size-3.5 text-[#94A3B8]" />
                    )}
                </div>
            </button>
            {open && (
                <div className="border-t border-[#E2E8F0] px-3 py-2 space-y-2">
                    {item.context?.text && (
                        <p className="text-[11px] text-[#64748B] italic line-clamp-3 bg-white rounded-lg px-2 py-1.5 border border-[#E2E8F0]">
                            📝 {item.context.text}
                        </p>
                    )}
                    {item.questions?.map((q, qi) => (
                        <div key={qi} className="text-[11px]">
                            <p className="font-semibold text-[#334155]">
                                Câu {qi + 1}: {q.questionText}
                            </p>
                            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-[#64748B]">
                                {q.options
                                    ?.filter(o => o.text)
                                    .map(o => (
                                        <span
                                            key={o.label}
                                            className={
                                                o.label === q.correctAnswer
                                                    ? 'font-bold text-[#16A34A]'
                                                    : ''
                                            }
                                        >
                                            {o.label}. {o.text}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * ImportQuestion — Multi-format import modal (Excel / Word / JSON).
 * Claymorphism design, createPortal, no shadcn.
 */
export default function ImportQuestion({ isOpen, onClose, onImport }) {
    const fileRef = useRef(null)
    const [activeTab, setActiveTab] = useState('excel')
    const [file, setFile] = useState(null)
    const [jsonText, setJsonText] = useState('')
    const [parsing, setParsing] = useState(false)
    const [importing, setImporting] = useState(false)
    const [parsed, setParsed] = useState(null) // { items, valid, errors }
    const [importResult, setImportResult] = useState(null) // { success, message } | null

    const resetState = useCallback(() => {
        setFile(null)
        setJsonText('')
        setParsed(null)
        setParsing(false)
        setImporting(false)
        setImportResult(null)
        if (fileRef.current) fileRef.current.value = ''
    }, [])

    /* lock body scroll */
    useEffect(() => {
        if (!isOpen) return
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    /* ESC key */
    useEffect(() => {
        if (!isOpen) return
        const handler = e => e.key === 'Escape' && onClose?.()
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    /* reset on open */
    useEffect(() => {
        if (isOpen) resetState()
    }, [isOpen, resetState])

    /* reset when tab changes */
    useEffect(() => {
        resetState()
    }, [activeTab, resetState])

    /* Auto-parse on file select */
    const handleFileChange = useCallback(
        async e => {
            const selected = e.target.files?.[0]
            if (!selected) return
            setFile(selected)
            setParsing(true)
            setParsed(null)
            setImportResult(null)
            try {
                const parser = PARSERS[activeTab]
                const result = await parser(selected)
                setParsed(result)
            } catch (err) {
                console.error('Parse error:', err)
                setParsed({
                    items: [],
                    valid: false,
                    errors: [`Lỗi đọc file: ${err.message}`],
                })
            } finally {
                setParsing(false)
            }
        },
        [activeTab]
    )

    /* Import handler */
    const handleImport = useCallback(async () => {
        if (!parsed?.valid || !parsed?.items?.length) return
        setImporting(true)
        setImportResult(null)
        try {
            await onImport?.(parsed.items)
            setImportResult({
                success: true,
                message: `Import thành công ${parsed.items.length} nhóm câu hỏi!`,
            })
            // Auto-close after 1.5s on success
            setTimeout(() => {
                onClose?.()
            }, 1500)
        } catch (err) {
            console.error('Import error:', err)
            setImportResult({
                success: false,
                message: err?.message || 'Có lỗi xảy ra khi import',
            })
        } finally {
            setImporting(false)
        }
    }, [parsed, onImport, onClose])

    /* Drag-and-drop */
    const handleDrop = useCallback(e => {
        e.preventDefault()
        const dropped = e.dataTransfer?.files?.[0]
        if (!dropped) return
        // Trigger via ref
        const dt = new DataTransfer()
        dt.items.add(dropped)
        if (fileRef.current) {
            fileRef.current.files = dt.files
            fileRef.current.dispatchEvent(new Event('change', { bubbles: true }))
        }
    }, [])

    const tabConfig = TABS.find(t => t.id === activeTab)
    const totalQuestions =
        parsed?.items?.reduce((sum, item) => sum + (item.questions?.length || 0), 0) || 0

    if (!isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose?.()}
        >
            <div
                className="relative flex w-full max-w-2xl flex-col rounded-2xl border-[3px] border-white/70 bg-white"
                style={{
                    boxShadow:
                        '8px 8px 24px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.6), inset 0 2px 0 rgba(255,255,255,0.5)',
                    maxHeight: 'min(90vh, 700px)',
                }}
            >
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between border-b-2 border-[#E2E8F0] px-5 py-3.5 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-[#F97316]/10">
                            <Upload className="size-4 text-[#F97316]" />
                        </div>
                        <h2
                            className="text-base font-bold text-[#1E293B]"
                            style={{ fontFamily: "'Noto Serif JP', serif" }}
                        >
                            Import câu hỏi
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#475569] cursor-pointer"
                        aria-label="Đóng"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* ─── Body (scrollable) ─── */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Tab selector */}
                    <div className="flex gap-2">
                        {TABS.map(tab => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer border-2 ${
                                        isActive
                                            ? 'border-current bg-opacity-10 text-current'
                                            : 'border-[#E2E8F0] text-[#94A3B8] hover:text-[#475569] hover:border-[#CBD5E1]'
                                    }`}
                                    style={
                                        isActive
                                            ? {
                                                  color: tab.color,
                                                  backgroundColor: `${tab.color}10`,
                                                  borderColor: `${tab.color}40`,
                                              }
                                            : undefined
                                    }
                                >
                                    <Icon className="size-3.5" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Template download */}
                    <div className="flex items-center gap-2 rounded-xl border-2 border-[#DBEAFE] bg-[#EFF6FF] px-3 py-2">
                        <Download className="size-3.5 text-[#2563EB] shrink-0" />
                        <span className="text-xs text-[#475569]">
                            Chưa có file mẫu?{' '}
                            <button
                                type="button"
                                onClick={tabConfig.downloadTemplate}
                                className="font-bold text-[#2563EB] underline underline-offset-2 cursor-pointer hover:text-[#1D4ED8]"
                            >
                                Tải template {tabConfig.label}
                            </button>
                        </span>
                    </div>

                    {/* Drop zone */}
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop}
                        className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 transition-all duration-200 hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5"
                        style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.03)' }}
                    >
                        {parsing ? (
                            <Loader2 className="size-8 animate-spin text-[#2563EB]" />
                        ) : (
                            <div
                                className="flex size-12 items-center justify-center rounded-2xl"
                                style={{ backgroundColor: `${tabConfig.color}15` }}
                            >
                                <tabConfig.icon
                                    className="size-5"
                                    style={{ color: tabConfig.color }}
                                />
                            </div>
                        )}
                        <div className="text-center">
                            <p className="text-sm font-semibold text-[#475569]">
                                {parsing
                                    ? 'Đang đọc file...'
                                    : file
                                      ? file.name
                                      : 'Kéo thả file hoặc nhấn để chọn'}
                            </p>
                            <p className="mt-1 text-xs text-[#94A3B8]">{tabConfig.desc}</p>
                        </div>
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        accept={tabConfig.accept}
                        onChange={handleFileChange}
                    />

                    {/* JSON paste area — only visible on JSON tab */}
                    {activeTab === 'json' && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <ClipboardPaste className="size-3.5 text-[#F97316]" />
                                <span className="text-xs font-bold text-[#334155]">
                                    Hoặc dán JSON trực tiếp
                                </span>
                            </div>
                            <textarea
                                value={jsonText}
                                onChange={e => {
                                    setJsonText(e.target.value)
                                    setParsed(null)
                                    setImportResult(null)
                                }}
                                placeholder='{&#10;  "items": [&#10;    { "section": "vocabulary", "level": "N5", ... }&#10;  ]&#10;}'
                                className="w-full rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-xs text-[#334155] font-mono placeholder:text-[#CBD5E1] focus:border-[#F97316]/40 focus:outline-none focus:ring-1 focus:ring-[#F97316]/20 transition-colors resize-none"
                                style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.03)' }}
                                rows={6}
                            />
                            <button
                                type="button"
                                disabled={!jsonText.trim() || parsing}
                                onClick={async () => {
                                    setParsing(true)
                                    setParsed(null)
                                    setFile(null)
                                    setImportResult(null)
                                    try {
                                        const result = parseJSONText(jsonText.trim())
                                        setParsed(result)
                                    } catch (err) {
                                        setParsed({
                                            items: [],
                                            valid: false,
                                            errors: [`JSON không hợp lệ: ${err.message}`],
                                        })
                                    } finally {
                                        setParsing(false)
                                    }
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#F97316]/30 bg-[#FFF7ED] px-3 py-1.5 text-xs font-semibold text-[#F97316] transition-all hover:bg-[#F97316]/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Code2 className="size-3" />
                                Phân tích JSON
                            </button>
                        </div>
                    )}

                    {/* Validation errors */}
                    {parsed && !parsed.valid && parsed.errors?.length > 0 && (
                        <div className="rounded-xl border-2 border-[#FCA5A5] bg-[#FEF2F2] p-3 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626]">
                                <AlertCircle className="size-3.5" />
                                Phát hiện {parsed.errors.length} lỗi
                            </div>
                            <ul className="space-y-0.5 text-[11px] text-[#991B1B] list-disc list-inside max-h-28 overflow-y-auto">
                                {parsed.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Preview */}
                    {parsed?.items?.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-[#334155]">
                                    Xem trước ({parsed.items.length} nhóm · {totalQuestions} câu
                                    hỏi)
                                </p>
                                {parsed.valid && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16A34A]">
                                        <CheckCircle2 className="size-3" /> Hợp lệ
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {parsed.items.map((item, i) => (
                                    <PreviewItem key={i} item={item} index={i} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Import result */}
                    {importResult && (
                        <div
                            className={`rounded-xl border-2 px-3 py-2.5 text-xs font-semibold flex items-center gap-2 ${
                                importResult.success
                                    ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]'
                                    : 'border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]'
                            }`}
                        >
                            {importResult.success ? (
                                <CheckCircle2 className="size-4" />
                            ) : (
                                <AlertCircle className="size-4" />
                            )}
                            {importResult.message}
                        </div>
                    )}
                </div>

                {/* ─── Footer ─── */}
                <div className="flex justify-end gap-2 border-t-2 border-[#E2E8F0] px-5 py-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-xl border-2 border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#475569] transition-all duration-200 hover:bg-[#F1F5F9] cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={!parsed?.valid || importing}
                        className="h-9 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#EA580C] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.3)' }}
                    >
                        {importing && <Loader2 className="size-3.5 animate-spin" />}
                        {importing
                            ? 'Đang import...'
                            : `Import${parsed?.items?.length ? ` (${parsed.items.length} nhóm)` : ''}`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}