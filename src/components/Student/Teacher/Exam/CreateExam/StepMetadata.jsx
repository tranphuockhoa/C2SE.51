import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function StepMetadata({ metadata, setMetadata }) {
    const handleChange = (key, value) => {
        const nextValue = value?.target ? value.target.value : value
        setMetadata(prev => ({
            ...prev,
            [key]: ['duration', 'passingScore'].includes(key) ? Number(nextValue) : nextValue,
        }))
    }

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
                <h2 className="text-xl font-bold text-[#1E293B]">Thông tin đề thi</h2>
                <p className="mt-1 text-sm text-[#64748B]">
                    Nhập các thông tin cơ bản cho đề thi JLPT
                </p>
            </div>

            <div className="space-y-5 rounded-2xl border-2 border-[#E2E8F0] bg-white p-6 shadow-sm">
                {/* Title */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#1E293B]">
                        Tiêu đề đề thi <span className="text-red-400">*</span>
                    </label>
                    <input
                        value={metadata.title}
                        onChange={e => handleChange('title', e)}
                        className="h-11 w-full rounded-xl border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                        placeholder="VD: Đề thi JLPT N5 – Đề 1"
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#1E293B]">Mô tả</label>
                    <textarea
                        value={metadata.description}
                        onChange={e => handleChange('description', e)}
                        rows={3}
                        className="w-full rounded-xl border-2 border-[#E2E8F0] p-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                        placeholder="Mô tả ngắn về đề thi..."
                    />
                </div>

                {/* Level */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#1E293B]">
                        Trình độ <span className="text-red-400">*</span>
                    </label>
                    <Select value={metadata.level} onValueChange={v => handleChange('level', v)}>
                        <SelectTrigger className="h-11 w-full rounded-xl border-2 border-[#E2E8F0]">
                            <SelectValue placeholder="Chọn level" />
                        </SelectTrigger>
                        <SelectContent>
                            {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                                <SelectItem key={level} value={level}>
                                    {level}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Grid: Duration + Passing Score */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#1E293B]">
                            Thời gian (phút) <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            min={10}
                            value={metadata.duration}
                            onChange={e => handleChange('duration', e)}
                            className="h-11 w-full rounded-xl border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-[#1E293B]">Điểm đạt</label>
                        <input
                            type="number"
                            min={0}
                            value={metadata.passingScore}
                            onChange={e => handleChange('passingScore', e)}
                            className="h-11 w-full rounded-xl border-2 border-[#E2E8F0] px-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                        />
                    </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#1E293B]">
                        Hướng dẫn làm bài
                    </label>
                    <textarea
                        value={metadata.instructions}
                        onChange={e => handleChange('instructions', e)}
                        rows={3}
                        className="w-full rounded-xl border-2 border-[#E2E8F0] p-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                        placeholder="Hướng dẫn cho thí sinh trước khi làm bài..."
                    />
                </div>

                {/* Public toggle */}
                <label className="flex items-center gap-3 rounded-xl border-2 border-[#E2E8F0] p-3 cursor-pointer hover:bg-[#F8FAFC]">
                    <input
                        type="checkbox"
                        checked={metadata.isPublic}
                        onChange={e =>
                            setMetadata(prev => ({ ...prev, isPublic: e.target.checked }))
                        }
                        className="size-4 rounded accent-[#2563EB]"
                    />
                    <div>
                        <p className="text-sm font-semibold text-[#1E293B]">Công khai</p>
                        <p className="text-xs text-[#64748B]">
                            Cho phép người học xem và làm đề thi này
                        </p>
                    </div>
                </label>
            </div>
        </div>
    )
}