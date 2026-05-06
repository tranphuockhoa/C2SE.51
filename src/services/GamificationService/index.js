import axiosInstance from '@/services/axiosInstance'

class GamificationService {
    api = axiosInstance

    async getAchievements() {
        const response = await this.api.post('/gamification/achievements')
        return response.data
    }

    async checkNewAchievements() {
        const response = await this.api.post('/gamification/achievements/check')
        return response.data
    }

    async getStudyGoal() {
        const response = await this.api.post('/gamification/study-goal')
        return response.data
    }

    async updateStudyGoal({ dailyQuestions, weeklyExams }) {
        const response = await this.api.post('/gamification/study-goal/update', { dailyQuestions, weeklyExams })
        return response.data
    }
}

export const gamificationService = new GamificationService()