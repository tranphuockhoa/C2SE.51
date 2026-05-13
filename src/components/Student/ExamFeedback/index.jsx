import Button from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { examFeedbackService } from '@/services'
import useAuthStore from '@/stores/authStore'
import {
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Flag,
    Loader2,
    MessageCircle,
    Send,
    Star,
    Trash2,
    User,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const REPORT_CATEGORIES = [
    { value: 'wrong_answer', label: 'Đáp án sai' },
    { value: 'duplicate_question', label: 'Câu hỏi trùng lặp' },
    { value: 'broken_media', label: 'Media bị lỗi' },
    { value: 'unclear_question', label: 'Đề bài không rõ ràng' },
    { value: 'other', label: 'Khác' },
]

/**
 * ExamFeedbackPanel — tabs: Bình luận, Báo lỗi, Đánh giá
 * @param {{ examId: string }} props
 */
export default function ExamFeedbackPanel({ examId }) {
    const [tab, setTab] = useState('comment')

    return (
        <div className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 shadow-card">
            <h2 className="text-base font-bold text-text mb-4">Phản hồi đề thi</h2>
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="bg-surface rounded-lg mb-1">
                    <TabsTrigger value="comment">
                        <MessageCircle className="size-3.5 mr-1.5" />
                        Bình luận
                    </TabsTrigger>
                    <TabsTrigger value="report">
                        <Flag className="size-3.5 mr-1.5" />
                        Báo lỗi
                    </TabsTrigger>
                    <TabsTrigger value="feedback">
                        <Star className="size-3.5 mr-1.5" />
                        Đánh giá
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="comment">
                    <CommentSection examId={examId} />
                </TabsContent>
                <TabsContent value="report">
                    <ReportSection examId={examId} />
                </TabsContent>
                <TabsContent value="feedback">
                    <FeedbackSection examId={examId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

/* ─────────────── Comment Section ─────────────── */

function CommentSection({ examId }) {
    const { isAuthenticated, user } = useAuthStore()
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [content, setContent] = useState('')
    const [guestName, setGuestName] = useState('')
    const [sending, setSending] = useState(false)

    const load = useCallback(
        async (p = 1) => {
            try {
                setLoading(true)
                const res = await examFeedbackService.list({
                    examId,
                    type: 'comment',
                    page: p,
                    limit: 15,
                })
                // res = { success, data: [...], pagination: { page, pages, ... } }
                const items = Array.isArray(res.data) ? res.data : []
                setComments(prev => (p === 1 ? items : [...prev, ...items]))
                setHasMore((res.pagination?.page ?? p) < (res.pagination?.pages ?? 1))
                setPage(p)
            } catch {
                // silently fail
            } finally {
                setLoading(false)
            }
        },
        [examId]
    )

    useEffect(() => {
        load(1)
    }, [load])

    const handleSubmit = async e => {
        e.preventDefault()
        if (!content.trim()) return
        setSending(true)
        try {
            const params = { examId, type: 'comment', content: content.trim() }
            if (!isAuthenticated && guestName.trim()) params.guestName = guestName.trim()
            await examFeedbackService.create(params)
            setContent('')
            load(1) // refresh
        } catch {
            // silently fail
        } finally {
            setSending(false)
        }
    }

    return (
        <div>
            {/* Compose */}
            <form onSubmit={handleSubmit} className="mb-4">
                {!isAuthenticated && (
                    <input
                        type="text"
                        placeholder="Tên của bạn (tuỳ chọn)"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background mb-2 outline-none focus:border-primary transition-colors"
                    />
                )}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Viết bình luận..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="flex-1 h-10 px-3 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary transition-colors"
                    />
                    <Button type="submit" size="sm" loading={sending} disabled={!content.trim()}>
                        <Send className="size-3.5" />
                    </Button>
                </div>
            </form>

            {/* Comments list */}
            {loading && comments.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-text-muted">
                    <Loader2 className="size-5 animate-spin" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                </p>
            ) : (
                <div className="space-y-3">
                    {comments.map(c => (
                        <CommentItem
                            key={c._id}
                            comment={c}
                            examId={examId}
                            onRefresh={() => load(1)}
                        />
                    ))}
                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => load(page + 1)}
                            disabled={loading}
                            className="w-full text-sm text-primary font-medium py-2 hover:underline cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Đang tải...' : 'Xem thêm bình luận'}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

function CommentItem({ comment, examId, onRefresh }) {
    const { isAuthenticated, user } = useAuthStore()
    const [showReplies, setShowReplies] = useState(false)
    const [replies, setReplies] = useState([])
    const [loadingReplies, setLoadingReplies] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [replyGuestName, setReplyGuestName] = useState('')
    const [replying, setReplying] = useState(false)
    const [showReplyForm, setShowReplyForm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const c = comment
    const authorName = c.user?.fullName || c.guestName || 'Khách'
    const isOwner = isAuthenticated && user?._id === c.user?._id
    const isAdmin = user?.role === 'admin'
    const replyCount = c.replyCount || 0

    const loadReplies = async () => {
        setLoadingReplies(true)
        try {
            const res = await examFeedbackService.listReplies({ parentId: c._id })
            setReplies(Array.isArray(res.data) ? res.data : [])
        } catch {
            //
        } finally {
            setLoadingReplies(false)
        }
    }

    const toggleReplies = () => {
        if (!showReplies && replies.length === 0 && replyCount > 0) loadReplies()
        setShowReplies(v => !v)
    }

    const handleReply = async e => {
        e.preventDefault()
        if (!replyContent.trim()) return
        setReplying(true)
        try {
            const params = {
                examId,
                type: 'comment',
                content: replyContent.trim(),
                parentId: c._id,
            }
            if (!isAuthenticated && replyGuestName.trim()) params.guestName = replyGuestName.trim()
            await examFeedbackService.create(params)
            setReplyContent('')
            setShowReplyForm(false)
            await loadReplies()
            setShowReplies(true)
        } catch {
            //
        } finally {
            setReplying(false)
        }
    }

    const handleDelete = async () => {
        if (deleting) return
        setDeleting(true)
        try {
            await examFeedbackService.remove(c._id)
            onRefresh()
        } catch {
            //
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="rounded-lg border border-border/60 p-3 bg-background/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <span className="size-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="size-3.5 text-primary" />
                    </span>
                    <span className="text-sm font-semibold text-text">{authorName}</span>
                    <span className="text-[10px] text-text-muted">
                        {formatTimeAgo(c.createdAt)}
                    </span>
                </div>
                {(isOwner || isAdmin) && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="size-7 rounded-md flex items-center justify-center text-text-muted hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                        title="Xoá"
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                )}
            </div>

            <p className="text-sm text-text-light mb-2 pl-9">{c.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 pl-9">
                <button
                    type="button"
                    onClick={() => setShowReplyForm(v => !v)}
                    className="text-xs text-text-muted hover:text-primary font-medium cursor-pointer"
                >
                    Trả lời
                </button>
                {replyCount > 0 && (
                    <button
                        type="button"
                        onClick={toggleReplies}
                        className="text-xs text-primary font-medium flex items-center gap-0.5 cursor-pointer"
                    >
                        {showReplies ? (
                            <>
                                <ChevronUp className="size-3" /> Ẩn {replyCount} phản hồi
                            </>
                        ) : (
                            <>
                                <ChevronDown className="size-3" /> Xem {replyCount} phản hồi
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Reply form */}
            {showReplyForm && (
                <form onSubmit={handleReply} className="mt-2 pl-9">
                    {!isAuthenticated && (
                        <input
                            type="text"
                            placeholder="Tên của bạn"
                            value={replyGuestName}
                            onChange={e => setReplyGuestName(e.target.value)}
                            className="w-full h-8 px-2.5 text-xs rounded-md border border-border bg-white mb-1.5 outline-none focus:border-primary transition-colors"
                        />
                    )}
                    <div className="flex gap-1.5">
                        <input
                            type="text"
                            placeholder="Viết phản hồi..."
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            className="flex-1 h-8 px-2.5 text-xs rounded-md border border-border bg-white outline-none focus:border-primary transition-colors"
                        />
                        <Button
                            type="submit"
                            size="sm"
                            loading={replying}
                            disabled={!replyContent.trim()}
                            className="h-8 px-2.5"
                        >
                            <Send className="size-3" />
                        </Button>
                    </div>
                </form>
            )}

            {/* Replies */}
            {showReplies && (
                <div className="mt-2 pl-9 space-y-2">
                    {loadingReplies ? (
                        <div className="flex items-center gap-2 py-2 text-text-muted text-xs">
                            <Loader2 className="size-3 animate-spin" /> Đang tải...
                        </div>
                    ) : (
                        replies.map(r => (
                            <div
                                key={r._id}
                                className="rounded-md border border-border/40 p-2.5 bg-white"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="size-2.5 text-primary" />
                                    </span>
                                    <span className="text-xs font-semibold text-text">
                                        {r.user?.fullName || r.guestName || 'Khách'}
                                    </span>
                                    <span className="text-[10px] text-text-muted">
                                        {formatTimeAgo(r.createdAt)}
                                    </span>
                                </div>
                                <p className="text-xs text-text-light pl-7">{r.content}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

/* ─────────────── Report Section ─────────────── */

function ReportSection({ examId }) {
    const { isAuthenticated } = useAuthStore()
    const [category, setCategory] = useState('wrong_answer')
    const [content, setContent] = useState('')
    const [guestName, setGuestName] = useState('')
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async e => {
        e.preventDefault()
        if (!content.trim()) return
        setSending(true)
        setSuccess(false)
        try {
            const params = {
                examId,
                type: /** @type {const} */ ('report'),
                content: content.trim(),
                reportCategory: category,
            }
            if (!isAuthenticated && guestName.trim()) params.guestName = guestName.trim()
            await examFeedbackService.create(params)
            setContent('')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 4000)
        } catch {
            //
        } finally {
            setSending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-text-muted">
                Nếu bạn phát hiện lỗi trong đề thi, hãy báo cáo để chúng tôi cải thiện.
            </p>

            {!isAuthenticated && (
                <input
                    type="text"
                    placeholder="Tên của bạn (tuỳ chọn)"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary transition-colors"
                />
            )}

            <div>
                <label className="text-xs font-semibold text-text mb-1.5 block">Loại lỗi</label>
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary transition-colors cursor-pointer"
                >
                    {REPORT_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-xs font-semibold text-text mb-1.5 block">
                    Mô tả chi tiết
                </label>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Ví dụ: Câu 5 đáp án sai, đáp án đúng phải là B..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary transition-colors resize-none"
                />
            </div>

            {success && (
                <div className="rounded-lg bg-cta/10 border border-cta/30 p-3 text-sm text-cta font-medium">
                    Cảm ơn bạn đã báo cáo! Chúng tôi sẽ xem xét sớm nhất.
                </div>
            )}

            <Button type="submit" size="sm" loading={sending} disabled={!content.trim()}>
                <AlertTriangle className="size-3.5" />
                Gửi báo cáo
            </Button>
        </form>
    )
}

/* ─────────────── Feedback (Rating) Section ─────────────── */

function FeedbackSection({ examId }) {
    const { isAuthenticated } = useAuthStore()
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [content, setContent] = useState('')
    const [guestName, setGuestName] = useState('')
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState(false)
    const [avgData, setAvgData] = useState(null)
    const [feedbacks, setFeedbacks] = useState([])
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(true)

    useEffect(() => {
        examFeedbackService
            .getRating(examId)
            .then(res => {
                setAvgData(res.data || res)
            })
            .catch(() => {})

        examFeedbackService
            .list({ examId, type: 'feedback', page: 1, limit: 10 })
            .then(res => {
                setFeedbacks(Array.isArray(res.data) ? res.data : [])
            })
            .catch(() => {})
            .finally(() => setLoadingFeedbacks(false))
    }, [examId])

    const handleSubmit = async e => {
        e.preventDefault()
        if (rating === 0) return
        setSending(true)
        setSuccess(false)
        try {
            const params = {
                examId,
                type: /** @type {const} */ ('feedback'),
                content: content.trim() || `Đánh giá ${rating} sao`,
                rating,
            }
            if (!isAuthenticated && guestName.trim()) params.guestName = guestName.trim()
            await examFeedbackService.create(params)
            setContent('')
            setRating(0)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 4000)

            // refresh
            const [ratingRes, listRes] = await Promise.all([
                examFeedbackService.getRating(examId),
                examFeedbackService.list({ examId, type: 'feedback', page: 1, limit: 10 }),
            ])
            setAvgData(ratingRes.data || ratingRes)
            setFeedbacks(Array.isArray(listRes.data) ? listRes.data : [])
        } catch {
            //
        } finally {
            setSending(false)
        }
    }

    const displayRating = hoverRating || rating

    return (
        <div>
            {/* Average rating */}
            {avgData && avgData.count > 0 && (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="text-center">
                        <p className="text-2xl font-black text-amber-600">
                            {avgData.avg?.toFixed(1) || '0.0'}
                        </p>
                        <div className="flex gap-0.5 justify-center">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                    key={s}
                                    className={cn(
                                        'size-3',
                                        s <= Math.round(avgData.avg || 0)
                                            ? 'text-amber-500 fill-amber-500'
                                            : 'text-amber-300'
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-amber-700">{avgData.count} lượt đánh giá</p>
                </div>
            )}

            {/* Rating form */}
            <form onSubmit={handleSubmit} className="space-y-3 mb-5">
                <div>
                    <label className="text-xs font-semibold text-text mb-1.5 block">
                        Đánh giá của bạn
                    </label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                type="button"
                                onMouseEnter={() => setHoverRating(s)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(s)}
                                className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                            >
                                <Star
                                    className={cn(
                                        'size-7 transition-colors',
                                        s <= displayRating
                                            ? 'text-amber-500 fill-amber-500'
                                            : 'text-border'
                                    )}
                                />
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-2 text-sm font-semibold text-amber-600 self-center">
                                {rating}/5
                            </span>
                        )}
                    </div>
                </div>

                {!isAuthenticated && (
                    <input
                        type="text"
                        placeholder="Tên của bạn (tuỳ chọn)"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary transition-colors"
                    />
                )}

                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Nhận xét thêm (tuỳ chọn)..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background outline-none focus:border-primary transition-colors resize-none"
                />

                {success && (
                    <div className="rounded-lg bg-cta/10 border border-cta/30 p-3 text-sm text-cta font-medium">
                        Cảm ơn bạn đã đánh giá!
                    </div>
                )}

                <Button type="submit" size="sm" loading={sending} disabled={rating === 0}>
                    <Star className="size-3.5" />
                    Gửi đánh giá
                </Button>
            </form>

            {/* Recent feedbacks */}
            {loadingFeedbacks ? (
                <div className="flex items-center justify-center py-6 text-text-muted">
                    <Loader2 className="size-5 animate-spin" />
                </div>
            ) : feedbacks.length > 0 ? (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Đánh giá gần đây
                    </h4>
                    {feedbacks.map(f => (
                        <div
                            key={f._id}
                            className="rounded-md border border-border/50 p-3 bg-background/50"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="size-3 text-primary" />
                                </span>
                                <span className="text-xs font-semibold text-text">
                                    {f.user?.fullName || f.guestName || 'Khách'}
                                </span>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            className={cn(
                                                'size-2.5',
                                                s <= (f.rating || 0)
                                                    ? 'text-amber-500 fill-amber-500'
                                                    : 'text-border'
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] text-text-muted">
                                    {formatTimeAgo(f.createdAt)}
                                </span>
                            </div>
                            {f.content && (
                                <p className="text-xs text-text-light pl-8">{f.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

/* ─────────────── Helper ─────────────── */

function formatTimeAgo(dateStr) {
    if (!dateStr) return ''
    const now = Date.now()
    const d = new Date(dateStr).getTime()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`
    return new Date(dateStr).toLocaleDateString('vi-VN')
}