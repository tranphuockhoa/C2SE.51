import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { adminRoutes, creatorRoutes, notFoundRoute, publicRoutes, studentRoutes } from './routes'

const routes = [...publicRoutes, ...studentRoutes, ...creatorRoutes, ...adminRoutes, notFoundRoute]

const router = createBrowserRouter(routes)

export default function Router() {
    return <RouterProvider router={router} />
}