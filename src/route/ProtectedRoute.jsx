import useAuthStore from '@/stores/authStore'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
    const { isAuthenticated, user } = useAuthStore()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/login" replace />
    }

    return element
}

export default ProtectedRoute