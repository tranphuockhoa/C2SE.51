import axiosInstance from '../axiosInstance'

class AdminService {
    /** GET /admin/statistics */
    getStatistics() {
        return axiosInstance.post('/admin/statistics')
    }


    
    /** GET /admin/users — paginated, filterable */
    getUsers({
        page = 1,
        limit = 20,
        role = undefined,
        status = undefined,
        search = undefined,
    } = {}) {
        return axiosInstance.post('/admin/users', { page, limit, role, status, search })
    }

    /** Update role */
    updateUserRole(userId, role) {
        return axiosInstance.post('/admin/users/update-role', { userId, role })
    }

    /** Toggle active/locked */
    toggleUserStatus(userId) {
        return axiosInstance.post('/admin/users/toggle-status', { userId })
    }

    /** Delete user */
    deleteUser(userId) {
        return axiosInstance.post('/admin/users/delete', { userId })
    }

    /** Thống kê lượt thi theo tuần/tháng (toàn hệ thống) */
    getAttemptChart({ period = 'week', count = 12 } = {}) {
        return axiosInstance.post('/admin/attempt-chart', { period, count })
    }
}

export const adminService = new AdminService()