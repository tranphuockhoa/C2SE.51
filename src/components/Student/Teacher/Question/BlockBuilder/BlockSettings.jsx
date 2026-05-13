import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, FileText, Image, Music, Plus, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { DIFFICULTIES, LEVELS, QUESTION_TYPES, SECTIONS } from './constants'

const selectCls =
    'h-10 w-full cursor-pointer appearance-none rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] px-3 pr-9 text-sm text-[#1E293B] outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
const inputCls =
    'h-10 w-full rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm text-[#1E293B] outline-none transition-all duration-200 placeholder:text-[#94A3B8] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
const textareaCls =
    'w-full rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#1E293B] outline-none transition-all duration-200 placeholder:text-[#94A3B8] resize-y hover:border-[#CBD5E1] focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
const labelCls = 'block text-xs font-semibold text-[#475569]'

/**
 * Block metadata settings — section, level, type, difficulty, context.
 * Claymorphism design — soft 3D, rounded elements, thick borders.
 */
export default function BlockSettings({ block, isGroup, onChange }) {
    const [showContextPanel, setShowContextPanel] = useState(true)
    const [manualContext, setManualContext] = useState(false)
    const audioInputRef = useRef(null)
    const imageInputRef = useRef(null)

    const showContext = isGroup || manualContext

    const update = (key, value) => onChange({ ...block, [key]: value })
    const updateContext = (key, value) =>
        onChange({ ...block, context: { ...block.context, [key]: value } })

    const questionTypes = QUESTION_TYPES[block.section] || []

    // Store audio file locally — actual upload deferred to submit time
    const handleAudioUpload = e => {
        const file = e.target.files?.[0]
        if (!file) return
        // Revoke old blob URL if exists
        if (block.context?._audioFile) {
            URL.revokeObjectURL(block.context.audioUrl)
        }
        const previewUrl = URL.createObjectURL(file)
        onChange({
            ...block,
            context: { ...block.context, audioUrl: previewUrl, _audioFile: file },
        })
    }

    // Store image file locally — actual upload deferred to submit time
    const handleImageUpload = e => {
        const file = e.target.files?.[0]
        if (!file) return
        // Revoke old blob URL if exists
        if (block.context?._imageFile) {
            URL.revokeObjectURL(block.context.imageUrl)
        }
        const previewUrl = URL.createObjectURL(file)
        onChange({
            ...block,
            context: { ...block.context, imageUrl: previewUrl, _imageFile: file },
        })
    }

    return (
        <div className="space-y-4">
            {/* ── Row 1: Core settings ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Phần thi */}
                <div className="space-y-1.5">
                    <label className={labelCls}>
                        Phần thi <span className="ml-0.5 text-[#F97316]">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={block.section}
                            onChange={e => {
                                const val = e.target.value
                                onChange({ ...block, section: val, questionType: '' })
                            }}
                            className={selectCls}
                        >
                            {SECTIONS.map(o => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                </div>

                {/* Trình độ */}
                <div className="space-y-1.5">
                    <label className={labelCls}>
                        Trình độ <span className="ml-0.5 text-[#F97316]">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={block.level}
                            onChange={e => update('level', e.target.value)}
                            className={selectCls}
                        >
                            {LEVELS.map(o => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                </div>

                {/* Loại câu hỏi */}
                <div className="space-y-1.5">
                    <label className={labelCls}>Loại câu hỏi</label>
                    <div className="relative">
                        <select
                            value={block.questionType}
                            onChange={e => update('questionType', e.target.value)}
                            className={selectCls}
                        >
                            <option value="" disabled>
                                Chọn loại...
                            </option>
                            {questionTypes.map(o => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                </div>

                {/* Độ khó */}
                <div className="space-y-1.5">
                    <label className={labelCls}>Độ khó</label>
                    <div className="relative">
                        <select
                            value={block.difficulty}
                            onChange={e => update('difficulty', e.target.value)}
                            className={selectCls}
                        >
                            {DIFFICULTIES.map(o => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                </div>
            </div>

            {/* ── Row 2: Title ── */}
            <div className="space-y-1.5">
                <label className={labelCls}>Tiêu đề nhóm</label>
                <input
                    type="text"
                    value={block.title}
                    onChange={e => update('title', e.target.value)}
                    placeholder="VD: Ôn Kanji N5..."
                    className={inputCls}
                />
            </div>

            {/* ── Context panel ── */}
            {showContext ? (
                <div
                    className="rounded-2xl border-2 border-dashed border-[#2563EB]/20 bg-[#EFF6FF]/50 p-4 space-y-3"
                    style={{ boxShadow: 'inset 0 2px 4px rgba(37,99,235,0.04)' }}
                >
                    <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
                            <FileText className="size-4 text-[#2563EB]" />
                            Context chung
                            {isGroup && (
                                <span className="rounded-lg bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                                    Nhóm
                                </span>
                            )}
                        </h4>
                        <button
                            type="button"
                            onClick={() => setShowContextPanel(p => !p)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#64748B] transition-colors duration-200 hover:bg-[#E2E8F0] cursor-pointer"
                        >
                            {showContextPanel ? (
                                <ChevronUp className="size-3.5" />
                            ) : (
                                <ChevronDown className="size-3.5" />
                            )}
                            {showContextPanel ? 'Thu gọn' : 'Mở rộng'}
                        </button>
                    </div>

                    {showContextPanel && (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Đoạn văn / Nội dung chung</label>
                                <textarea
                                    value={block.context?.text || ''}
                                    onChange={e => updateContext('text', e.target.value)}
                                    placeholder="Nhập đoạn văn đọc hiểu, nội dung chung cho các câu hỏi..."
                                    rows={4}
                                    className={textareaCls}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
                                        <Music className="size-3.5 text-[#94A3B8]" />
                                        Audio
                                    </label>
                                    <input
                                        ref={audioInputRef}
                                        type="file"
                                        accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/mpeg"
                                        onChange={handleAudioUpload}
                                        className="hidden"
                                    />
                                    {block.context?.audioUrl ? (
                                        <div className="space-y-1.5">
                                            <audio
                                                src={block.context.audioUrl}
                                                controls
                                                className="w-full h-8"
                                            />
                                            <div className="flex items-center gap-2">
                                                {block.context?._audioFile && (
                                                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                                        Chưa upload
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (block.context?._audioFile) {
                                                            URL.revokeObjectURL(
                                                                block.context.audioUrl
                                                            )
                                                        }
                                                        onChange({
                                                            ...block,
                                                            context: {
                                                                ...block.context,
                                                                audioUrl: '',
                                                                _audioFile: null,
                                                            },
                                                        })
                                                        if (audioInputRef.current)
                                                            audioInputRef.current.value = ''
                                                    }}
                                                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    <X className="size-3" />
                                                    Xóa audio
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => audioInputRef.current?.click()}
                                            className={cn(
                                                'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] py-2.5 text-sm text-[#94A3B8] transition-all duration-200 hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 hover:text-[#2563EB] cursor-pointer'
                                            )}
                                        >
                                            <Upload className="size-4" />
                                            Chọn audio
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
                                        <Image className="size-3.5 text-[#94A3B8]" />
                                        Hình ảnh
                                    </label>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    {block.context?.imageUrl ? (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={block.context.imageUrl}
                                                alt="preview"
                                                className="h-14 w-14 rounded-lg object-cover border-2 border-[#E2E8F0]"
                                            />
                                            {block.context?._imageFile && (
                                                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                                    Chưa upload
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (block.context?._imageFile) {
                                                        URL.revokeObjectURL(block.context.imageUrl)
                                                    }
                                                    onChange({
                                                        ...block,
                                                        context: {
                                                            ...block.context,
                                                            imageUrl: '',
                                                            _imageFile: null,
                                                        },
                                                    })
                                                    if (imageInputRef.current)
                                                        imageInputRef.current.value = ''
                                                }}
                                                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 cursor-pointer"
                                            >
                                                <X className="size-3" />
                                                Xóa
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            className={cn(
                                                'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] py-2.5 text-sm text-[#94A3B8] transition-all duration-200 hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 hover:text-[#2563EB] cursor-pointer'
                                            )}
                                        >
                                            <Upload className="size-4" />
                                            Chọn hình ảnh
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Hướng dẫn làm bài</label>
                                <input
                                    type="text"
                                    value={block.instructions || ''}
                                    onChange={e => update('instructions', e.target.value)}
                                    placeholder="VD: Đọc đoạn văn dưới đây, trả lời các câu hỏi..."
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setManualContext(true)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#64748B] transition-all duration-200 hover:bg-[#F1F5F9] hover:text-[#2563EB] cursor-pointer"
                >
                    <Plus className="size-4" />
                    Thêm context chung (đoạn văn, audio, hình ảnh)
                </button>
            )}
        </div>
    )
}