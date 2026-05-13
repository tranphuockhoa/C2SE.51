import useAuthStore from '@/stores/authStore'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
})

axiosInstance.interceptors.request.use(
    config => {
        const token = useAuthStore.getState().token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            const { isAuthenticated, logout } = useAuthStore.getState()
            // Only redirect to login if the user was previously authenticated
            // (token expired / invalidated). Don't redirect guest users.
            if (isAuthenticated) {
                logout()
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance