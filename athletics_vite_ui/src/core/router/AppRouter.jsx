import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '@shared/components/MainLayout';
import HomePage from '@modules/home/ui/pages/HomePage';
import LoginPage from '@modules/auth/ui/pages/LoginPage';
import RegisterPage from '@modules/auth/ui/pages/RegisterPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '@modules/home/ui/dashboard/layouts/DashboardLayout';
import DashboardPage from '@modules/home/ui/dashboard/pages/DashboardPage';
import UserRoleManagementPage from '@modules/admin/ui/pages/UserRoleManagementPage';
import ProfilePage from '@modules/auth/ui/pages/ProfilePage';
import AdminUsersTable from '../../modules/admin/ui/pages/admin_controller_user_ui';


const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            // Add more routes here
            {
                path: '*',
                element: <Navigate to="/" replace />,
            },
        ],
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/dashboard',
        element: <ProtectedRoute />,
        children: [
            {
                element: (
                    <DashboardLayout>
                        <Outlet />
                    </DashboardLayout>
                ),
                children: [
                    {
                        index: true,
                        element: <DashboardPage />,
                    },
                    {
                        path: 'users',
                        element: <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />,
                        children: [
                            {
                                index: true,
                                element: <UserRoleManagementPage />,
                            },
                        ],
                    },
                    // Add other dashboard routes here
                ],
            },
        ],
    },
    {
        path: '/profile',
        element: <ProtectedRoute />,
        children: [
            {
                element: (
                    <DashboardLayout>
                        <Outlet />
                    </DashboardLayout>
                ),
                children: [
                    {
                        index: true,
                        element: <ProfilePage />,
                    },
                ],
            },
        ],
    },

    {
        path: '/admin',
        element: <ProtectedRoute />,
        children: [
            {
                element: (
                    <DashboardLayout>
                        <Outlet />
                    </DashboardLayout>
                ),
                children: [
                    {
                        index: true,
                        element: <AdminUsersTable/>,
                    },
                ],
            },
        ],
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
