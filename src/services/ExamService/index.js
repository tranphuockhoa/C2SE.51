import axiosInstance from '@/services/axiosInstance'

class ExamService {
    api = axiosInstance

    /**
     * Tạo bài thi mới
     * POST /exam/create
     * Hỗ trợ 3 cách tạo block: blockId, questionIds, inline questions
     */
    async createExam(payload) {
        const response = await this.api.post('/exams/create', payload)
        return response.data
    }

    /**
     * Danh sách bài thi (có search & pagination)
     * POST /exam/list
     */
    async getExams(body = {}) {
        const response = await this.api.post('/exams/list', body)
        return response.data
    }

    /**
     * Chi tiết bài thi (kèm tất cả câu hỏi)
     * POST /exam/get-by-id
     */
    async getExamById(examId) {
        const response = await this.api.post('/exams/get-by-id', { examId })
        return response.data
    }

    /**
     * Cập nhật metadata bài thi
     * POST /exam/update
     */
    async updateExam(body) {
        const response = await this.api.post('/exams/update', body)
        return response.data
    }

    /**
     * Thêm block câu hỏi vào section
     * POST /exam/add-block
     */
    async addBlockToExam({ examId, sectionIndex, block }) {
        const response = await this.api.post('/exams/add-block', { examId, sectionIndex, block })
        return response.data
    }

    /**
     * Xóa block khỏi exam
     * POST /exam/remove-block
     */
    async removeBlockFromExam({ examId, sectionIndex, blockIndex }) {
        const response = await this.api.post('/exams/remove-block', {
            examId,
            sectionIndex,
            blockIndex,
        })
        return response.data
    }

    /**
     * Cập nhật câu hỏi embedded trong exam
     * POST /exam/update-question
     */
    async updateExamQuestion({ examId, sectionIndex, blockIndex, questionIndex, questionData }) {
        const response = await this.api.post('/exams/update-question', {
            examId,
            sectionIndex,
            blockIndex,
            questionIndex,
            questionData,
        })
        return response.data
    }

    /**
     * Xóa câu hỏi embedded trong exam
     * POST /exam/remove-question
     */
    async removeQuestionFromExam({ examId, sectionIndex, blockIndex, questionIndex }) {
        const response = await this.api.post('/exams/remove-question', {
            examId,
            sectionIndex,
            blockIndex,
            questionIndex,
        })
        return response.data
    }

    /**
     * Xóa bài thi
     * POST /exam/delete
     */
    async deleteExam(examId) {
        const response = await this.api.post('/exams/delete', { examId })
        return response.data
    }

    /**
     * Publish bài thi
     * POST /exam/publish
     */
    async publishExam(examId) {
        const response = await this.api.post('/exams/publish', { examId })
        return response.data
    }

    /**
     * Lấy bài thi mẫu
     * GET /exam/sample
     */
    async getSampleExam() {
        const response = await this.api.get('/exams/sample')
        return response.data
    }

    /**
     * Lấy danh sách đề thi theo level (cho student, không cần đăng nhập)
     * POST /public/exams
     */
    async getExamsByLevel(level) {
        const response = await this.api.post('/public/exams', { level })
        return response.data
    }
}

export const examService = new ExamService()