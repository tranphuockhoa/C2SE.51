import axiosInstance from '@/services/axiosInstance'

class ExamFeedbackService {
    api = axiosInstance

    /**
     * List feedbacks for an exam (top-level).
     * @param {Object} params
     * @param {string} params.examId
     * @param {'comment'|'report'|'feedback'} [params.type]
     * @param {number} [params.page]
     * @param {number} [params.limit]
     */
    async list({ examId, type, page = 1, limit = 20 }) {
        const res = await this.api.post('/exam-feedbacks/list', { examId, type, page, limit })
        return res.data
    }

    /**
     * List replies for a parent feedback.
     */
    async listReplies({ parentId, page = 1, limit = 50 }) {
        const res = await this.api.post('/exam-feedbacks/replies', { parentId, page, limit })
        return res.data
    }

    /**
     * Get average rating for an exam.
     */
    async getRating(examId) {
        const res = await this.api.post('/exam-feedbacks/rating', { examId })
        return res.data
    }

    /**
     * Create a comment, report, or feedback.
     * @param {Object} params
     * @param {string} params.examId
     * @param {'comment'|'report'|'feedback'} params.type
     * @param {string} params.content
     * @param {number} [params.rating] - 1-5, only for feedback
     * @param {string} [params.reportCategory] - only for report
     * @param {string} [params.questionRef] - optional question reference
     * @param {string} [params.parentId] - for replies
     * @param {string} [params.guestName] - for guest users
     */
    async create(params) {
        const res = await this.api.post('/exam-feedbacks/create', params)
        return res.data
    }

    /**
     * Delete a feedback.
     */
    async remove(feedbackId) {
        const res = await this.api.post('/exam-feedbacks/delete', { feedbackId })
        return res.data
    }

    /**
     * List reports on my exams (creator).
     */
    async myReports({ page = 1, limit = 20 } = {}) {
        const res = await this.api.post('/exam-feedbacks/my-reports', { page, limit })
        return res.data
    }
}

export const examFeedbackService = new ExamFeedbackService()