import axiosInstance from '@/services/axiosInstance'

class ExamAttemptService {
    api = axiosInstance

    /**
     * Bắt đầu bài thi
     * POST /exam-attempts/start
     * @param {Object} params
     * @param {string} params.examId
     * @param {"full_test"|"practice"} params.mode
     * @param {string[]} [params.practiceSections] - section types khi practice
     * @param {number} [params.practiceMinutes] - thời gian tự chọn khi practice
     */
    async startExam({ examId, mode = 'full_test', practiceSections, practiceMinutes }) {
        const response = await this.api.post('/exam-attempts/start', {
            examId,
            mode,
            practiceSections,
            practiceMinutes,
        })
        return response.data
    }

    /**
     * Nộp bài thi (gửi tất cả câu trả lời)
     * POST /exam-attempts/submit
     * @param {Object} params
     * @param {string} params.attemptId
     * @param {Array<{questionId: string, selectedAnswer: string}>} params.answers
     */
    async submitExam({ attemptId, answers }) {
        const response = await this.api.post('/exam-attempts/submit', { attemptId, answers })
        return response.data
    }

    /**
     * Chấm luyện tập (không lưu DB)
     * POST /exam-attempts/evaluate-practice
     */
    async evaluatePractice({ examId, sectionTypes, answers }) {
        const response = await this.api.post('/exam-attempts/evaluate-practice', {
            examId,
            sectionTypes,
            answers,
        })
        return response.data
    }

    /**
     * Thông tin exam cho student (không kèm câu hỏi)
     * POST /exam-attempts/exam-info
     */
    async getExamInfo(examId) {
        const response = await this.api.post('/exam-attempts/exam-info', { examId })
        return response.data
    }

    /**
     * Kết quả bài thi đã nộp (có chi tiết từng câu)
     * POST /exam-attempts/result
     */
    async getAttemptResult(attemptId) {
        const response = await this.api.post('/exam-attempts/result', { attemptId })
        return response.data
    }

    /**
     * Lịch sử làm bài
     * POST /exam-attempts/my-attempts
     */
    async getMyAttempts(params = {}) {
        const response = await this.api.post('/exam-attempts/my-attempts', params)
        return response.data
    }

    /**
     * Chi tiết lần làm bài
     * POST /exam-attempts/get-by-id
     */
    async getAttemptById(attemptId) {
        const response = await this.api.post('/exam-attempts/get-by-id', { attemptId })
        return response.data
    }

    /**
     * Thống kê profile user (tổng hợp các lần làm đề)
     * POST /exam-attempts/profile-stats
     */
    async getProfileStats() {
        const response = await this.api.post('/exam-attempts/profile-stats')
        return response.data
    }

    /**
     * Lấy câu sai từ các lần thi gần đây
     * POST /exam-attempts/wrong-questions
     */
    async getWrongQuestions() {
        const response = await this.api.post('/exam-attempts/wrong-questions')
        return response.data
    }

    /**
     * Leaderboard
     * POST /exam-attempts/leaderboard
     */
    async getLeaderboard({ period = undefined, level = undefined, limit = undefined } = {}) {
        const response = await this.api.post('/exam-attempts/leaderboard', { period, level, limit })
        return response.data
    }

    /**
     * Gợi ý bài thi phù hợp
     * POST /exam-attempts/recommendations
     */
    async getRecommendations() {
        const response = await this.api.post('/exam-attempts/recommendations')
        return response.data
    }

    /**
     * Thống kê lượt thi theo tuần/tháng (cho creator)
     * POST /exam-attempts/creator-attempt-chart
     */
    async getCreatorAttemptChart({ period = 'week', count = 12 } = {}) {
        const response = await this.api.post('/exam-attempts/creator-attempt-chart', {
            period,
            count,
        })
        return response.data
    }

    /**
     * Lấy danh sách bài thi đang làm dở
     * POST /exam-attempts/active
     */
    async getActiveAttempts() {
        const response = await this.api.post('/exam-attempts/active')
        return response.data
    }
}

export const examAttemptService = new ExamAttemptService()