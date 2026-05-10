import { examAttemptService } from '@/services'
import useAuthStore from '@/stores/authStore'
import { Clock, PlayCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * ActiveExamBanner - Displays a notification when user has in-progress exam attempts.
 * Shows at the top of the student layout.
 */
export default function ActiveExamBanner() {
    const { isAuthenticated } = useAuthStore()
    const location = useLocation()
    const [attempts, setAttempts] = useState([])
    const [dismissed, setDismissed] = useState(false)

    // Hide banner when user is already on the exam take page
    const isOnExamPage = /\/exam\/[^/]+\/take/.test(location.pathname)

    useEffect(() => {
        if (!isAuthenticated) return
        let cancelled = false
        const load = async () => {
            try {
                const res = await examAttemptService.getActiveAttempts()
                if (!cancelled) setAttempts(res.data || [])
            } catch {
                // silently ignore
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [isAuthenticated])

    if (!attempts.length || dismissed || isOnExamPage) return null

    return (
        <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <Clock className="size-4 text-amber-600 shrink-0" />
                    <span className="text-sm text-amber-800 font-medium truncate">
                        Bạn có {attempts.length} bài thi đang làm dở
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        to={`/exam/${attempts[0]?.exam?._id || attempts[0]?.exam}`}
                        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        <PlayCircle className="size-3.5" />
                        Tiếp tục
                    </Link>
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1 rounded text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                        aria-label="Đóng"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}