import { Outlet } from 'react-router-dom'
import ActiveExamBanner from './ActiveExamBanner'
import StudentFooter from './StudentFooter'
import StudentHeader from './StudentHeader'

export default function StudentLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <StudentHeader />
            <ActiveExamBanner />
            <main className="flex-1">
                <Outlet />
            </main>
            <StudentFooter />
        </div>
    )
}