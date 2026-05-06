import axiosInstance from '../axiosInstance'

export const authService = {
    login: data => axiosInstance.post('/auth/login', data),
    register: data => axiosInstance.post('/auth/register', data),
    getMe: () => axiosInstance.post('/auth/me'),
    updateProfile: data => axiosInstance.post('/auth/profile', data),
    changePassword: data => axiosInstance.post('/auth/change-password', data),
}