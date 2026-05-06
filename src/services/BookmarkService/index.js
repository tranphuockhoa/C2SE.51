import axiosInstance from '@/services/axiosInstance'

class BookmarkService {
    api = axiosInstance

    async toggle({ examId, questionId, sectionType }) {
        const response = await this.api.post('/bookmarks/toggle', { examId, questionId, sectionType })
        return response.data
    }

    async getMyBookmarks({ page, limit, sectionType } = {}) {
        const response = await this.api.post('/bookmarks/my-bookmarks', { page, limit, sectionType })
        return response.data
    }

    async checkBookmarks(questionIds) {
        const response = await this.api.post('/bookmarks/check', { questionIds })
        return response.data
    }
}

export const bookmarkService = new BookmarkService()