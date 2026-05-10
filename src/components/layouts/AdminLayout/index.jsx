import DashboardLayout from '@/components/layouts/DashboardLayout'
import { menuItemsAdmin } from '@/constants/MenuItem'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
    return (
        <DashboardLayout title="Quản trị" basePath="/admin" menuItems={menuItemsAdmin}>
            <Outlet />
        </DashboardLayout>
    )
}