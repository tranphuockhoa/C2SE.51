import DashboardLayout from '@/components/layouts/DashboardLayout'
import { menuItems } from '@/constants/MenuItem'
import { Outlet } from 'react-router-dom'

export default function TeacherLayout() {
    return (
        <DashboardLayout title="Người tạo đề" basePath="/creator" menuItems={menuItems}>
            <Outlet />
        </DashboardLayout>
    )
}