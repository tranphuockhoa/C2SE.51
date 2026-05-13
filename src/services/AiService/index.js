import axiosInstance from '@/services/axiosInstance'

class AiService {
    api = axiosInstance

    /**
     * Teacher: Tạo giải thích AI cho câu hỏi (khi soạn câu hỏi)
     * POST /questions/ai-explain
     */
    async generateExplanation({
        questionText,
        options,
        correctAnswer,
        level,
        sectionType,
        context,
        questionId,
    }) {
        const response = await this.api.post('/questions/ai-explain', {
            questionText,
            options,
            correctAnswer,
            level,
            sectionType,
            context,
            questionId,
        })
        return response.data
    }

    /**
     * Student: Yêu cầu giải thích cho câu hỏi trong đề thi
     * Flow: check DB → nếu chưa có → gọi AI → lưu DB → trả về
     * POST /questions/ai-explain-exam-question
     */
    async explainExamQuestion({ examId, questionId }) {
        const response = await this.api.post('/questions/ai-explain-exam-question', {
            examId,
            questionId,
        })
        return response.data
    }
}

export const aiService = new AiService()