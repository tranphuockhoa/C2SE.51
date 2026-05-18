import { toast } from '@/utils/toast'

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date, options = {}) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options,
    })
}

/**
 * Format datetime
 */
export function formatDateTime(date) {
    if (!date) return '—'
    return new Date(date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Format duration in minutes to "Xh Ym"
 */
export function formatDuration(minutes) {
    if (!minutes) return '—'
    if (minutes < 60) return `${minutes} phút`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}p` : `${h} giờ`
}

/**
 * Format total time in seconds to human-readable (e.g. "2h 30ph", "45ph")
 */
export function formatTotalTime(seconds) {
    if (!seconds || seconds <= 0) return '0ph'
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes}ph`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}ph` : `${h}h`
}

/**
 * Format seconds to "mm:ss"
 */
export function formatTimer(seconds) {
    if (seconds == null || seconds < 0) return '00:00'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * JLPT level utilities
 */
export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

export const LEVEL_COLORS = {
    N5: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    N4: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    N3: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    N2: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    N1: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
}

export const SECTION_LABELS = {
    vocabulary: 'Từ vựng',
    grammar: 'Ngữ pháp',
    reading: 'Đọc hiểu',
    listening: 'Nghe hiểu',
}

export const SECTION_ICONS = {
    vocabulary: '文',
    grammar: '法',
    reading: '読',
    listening: '聴',
}

export const EXAM_STATUS_LABELS = {
    draft: 'Nháp',
    published: 'Đã xuất bản',
    archived: 'Đã lưu trữ',
}

/**
 * Truncate text
 */
export function truncate(str, max = 80) {
    if (!str || str.length <= max) return str
    return str.slice(0, max) + '...'
}

/**
 * Safe JSON parse
 */
export function safeParse(str, fallback = null) {
    try {
        return JSON.parse(str)
    } catch {
        return fallback
    }
}

/**
 * Copy text to clipboard with toast
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        toast.success('Đã sao chép!')
    } catch {
        toast.error('Không thể sao chép')
    }
}