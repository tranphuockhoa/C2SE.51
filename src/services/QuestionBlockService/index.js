import axiosInstance from '@/services/axiosInstance'

class QuestionBlockService {
    api = axiosInstance

    /**
     * Tạo blocks (standalone + group) trong 1 call
     * POST /question-blocks/create
     * @param {{ items: Array }} body
     */
    async createBlocks(body) {
        const response = await this.api.post('/question-blocks/create', body)
        return response.data
    }

    /**
     * Danh sách blocks với search & pagination
     * POST /question-blocks/list
     */
    async getBlocks(body = {}) {
        const response = await this.api.post('/question-blocks/list', body)
        return response.data
    }

    /**
     * Chi tiết block + questions
     * POST /question-blocks/get-by-id
     */
    async getBlockById(blockId) {
        const response = await this.api.post('/question-blocks/get-by-id', { blockId })
        return response.data
    }

    /**
     * Cập nhật block
     * POST /question-blocks/update
     */
    async updateBlock(body) {
        const response = await this.api.post('/question-blocks/update', body)
        return response.data
    }

    /**
     * Xóa block + questions
     * POST /question-blocks/delete
     */
    async deleteBlock(blockId) {
        const response = await this.api.post('/question-blocks/delete', { blockId })
        return response.data
    }

    /**
     * Thêm questions vào block đã tồn tại
     * POST /questions/add-to-block
     */
    async addQuestionsToBlock(blockId, questions) {
        const response = await this.api.post('/questions/add-to-block', { blockId, questions })
        return response.data
    }

    /**
     * Cập nhật 1 câu hỏi
     * POST /questions/update
     */
    async updateQuestion(body) {
        const response = await this.api.post('/questions/update', body)
        return response.data
    }

    /**
     * Xóa 1 câu hỏi
     * POST /questions/delete
     */
    async deleteQuestion(questionId) {
        const response = await this.api.post('/questions/delete', { questionId })
        return response.data
    }

    /**
     * Cập nhật toàn bộ block + questions
     * POST /question-blocks/update-full
     */
    async updateFullBlock(body) {
        const response = await this.api.post('/question-blocks/update-full', body)
        return response.data
    }
}


export const questionBlockService = new QuestionBlockService()