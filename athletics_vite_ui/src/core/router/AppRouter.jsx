import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '@shared/components/MainLayout';
import HomePage from '@modules/home/ui/pages/HomePage';
import LoginPage from '@modules/auth/ui/pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '@modules/home/ui/dashboard/layouts/DashboardLayout';
import DashboardPage from '@modules/home/ui/dashboard/pages/DashboardPage';

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
                    // Add other dashboard routes here
                ],
            },
        ],
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;
