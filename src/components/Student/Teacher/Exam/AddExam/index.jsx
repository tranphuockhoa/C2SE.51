import Modal from '@/components/ui/Modal'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useRef, useState } from 'react'

export default function AddExam({ isOpen, onClose, onSubmit }) {
    const initialForm = useRef({
        title: '',
        description: '',
        level: 'N5',
        status: 'draft',
        totalQuestions: 50,
        duration: 60,
        schedule: '',
    })

    const [formData, setFormData] = useState({ ...initialForm.current })

    const resetForm = () => setFormData({ ...initialForm.current })

    const handleChange = (key, value) => {
        const nextValue = value?.target ? value.target.value : value

        setFormData(prev => {
            if (key === 'totalQuestions' || key === 'duration')
                return { ...prev, [key]: Number(nextValue) }
            return { ...prev, [key]: nextValue }
        })
    }

    const handleSubmit = async event => {
        event.preventDefault()

        const payload = {
            ...formData,
            schedule: formData.schedule || 'Chưa cập nhật',
            duration: `${formData.duration} phút`,
            totalQuestions: Number(formData.totalQuestions),
        }

        await onSubmit?.(payload)
        resetForm()
        onClose?.()
    }

    const handleClose = () => {
        resetForm()
        onClose?.()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl" title="Tạo đề thi">
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Tiêu đề đề thi</label>
                    <input
                        value={formData.title}
                        onChange={e => handleChange('title', e)}
                        className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                        placeholder="Nhập tên đề thi..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Mô tả ngắn</label>
                    <textarea
                        value={formData.description}
                        onChange={e => handleChange('description', e)}
                        className="min-h-25 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-black"
                        placeholder="Đề thi gồm những phần nào, mục tiêu là gì..."
                        required
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Trình độ</label>
                        <Select
                            value={formData.level}
                            onValueChange={v => handleChange('level', v)}
                        >
                            <SelectTrigger className="h-11 w-full rounded-xl border-gray-200">
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Trạng thái</label>
                        <Select
                            value={formData.status}
                            onValueChange={v => handleChange('status', v)}
                        >
                            <SelectTrigger className="h-11 w-full rounded-xl border-gray-200">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Nháp</SelectItem>
                                <SelectItem value="published">Xuất bản</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Số câu hỏi</label>
                        <input
                            type="number"
                            min="10"
                            value={formData.totalQuestions}
                            onChange={e => handleChange('totalQuestions', e)}
                            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">
                            Thời lượng (phút)
                        </label>
                        <input
                            type="number"
                            min="10"
                            value={formData.duration}
                            onChange={e => handleChange('duration', e)}
                            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Lịch thi dự kiến</label>
                    <input
                        type="datetime-local"
                        value={formData.schedule}
                        onChange={e => handleChange('schedule', e)}
                        className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
                    >
                        Lưu đề thi
                    </button>
                </div>
            </form>
        </Modal>
    )
}