import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange, className }) {
    if (totalPages <= 1) return null

    const getPages = () => {
        const pages = []
        const start = Math.max(1, page - 2)
        const end = Math.min(totalPages, page + 2)
        if (start > 1) {
            pages.push(1)
            if (start > 2) pages.push('...')
        }
        for (let i = start; i <= end; i++) pages.push(i)
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...')
            pages.push(totalPages)
        }
        return pages
    }
