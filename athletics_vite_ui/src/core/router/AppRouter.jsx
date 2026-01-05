import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '@shared/components/MainLayout';
import HomePage from '@modules/home/ui/pages/HomePage';
import LoginPage from '@modules/auth/ui/pages/LoginPage';
import RegisterPage from '@modules/auth/ui/pages/RegisterPage';
import PasswordResetPage from '@modules/auth/ui/pages/PasswordResetPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '@modules/home/ui/dashboard/layouts/DashboardLayout';
import DashboardPage from '@modules/home/ui/dashboard/pages/DashboardPage';
import UserRoleManagementPage from '@modules/admin/ui/pages/UserRoleManagementPage';
import ProfilePage from '@modules/auth/ui/pages/ProfilePage';
import AdminUsersTable from '../../modules/admin/ui/pages/admin_controller_user_ui';
import PruebasPage from '../../modules/competencia/ui/pages/PruebasPage';
import BaremosPage from '../../modules/competencia/ui/pages/BaremosPage';
import TipoDisciplinaPage from '../../modules/competencia/ui/pages/TipoDisciplinaPage';
import GestionEntrenamientosPage from '@modules/entrenador/ui/pages/GestionEntrenamientosPage';
import GestionAsistenciaPage from '@modules/entrenador/ui/pages/GestionAsistenciaPage';
import HorarioManager from '../../modules/entrenador/ui/components/HorarioManager';
import RegisterAthletePage from '../../modules/representante/ui/pages/RegisterAthletePage';
import MisAtletasPage from '../../modules/representante/ui/pages/MisAtletasPage';


const ALLOWED_ALL_ROLES = ['ADMINISTRADOR', 'ENTRENADOR', 'ATLETA', 'REPRESENTANTE']

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
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
        path: '/forgot-password',
        element: <PasswordResetPage />,
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
                    {
                        path: 'admin',
                        element: <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />,
                        children: [
                            {
                                index: true,
                                element: <AdminUsersTable />,
                            },
                        ],
                    },
                    // SECCIÓN DE PRUEBAS Y SUS HIJOS
                    {
                        path: 'pruebas',
                        element: <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENTRENADOR']} />,
                        children: [
                            {
                                index: true, // URL: /dashboard/pruebas
                                element: <PruebasPage />,
                            },
                            {
                                path: 'baremos', // URL: /dashboard/pruebas/baremos
                                element: <BaremosPage />,
                            },
                            {
                                path: 'disciplinas', // URL: /dashboard/pruebas/disciplinas
                                element: <TipoDisciplinaPage />,
                            },
                        ],
                    },
                    {
                        path: 'entrenamientos',
                        element: <ProtectedRoute allowedRoles={['ENTRENADOR']} />,
                        children: [
                            {
                                index: true,
                                element: <GestionEntrenamientosPage />,
                            },
                            {
                                path: ':id/asistencia',
                                element: <GestionAsistenciaPage />,
                            },
                        ],
                    },
                    {
                        path: 'representante',
                        element: <ProtectedRoute allowedRoles={['REPRESENTANTE']} />,
                        children: [
                            {
                                path: 'mis-atletas',
                                element: <MisAtletasPage />
                            },
                            {
                                path: 'register-athlete',
                                element: <RegisterAthletePage />
                            }
                        ]
                    },
                ],
            },
        ],
    },
    {
        path: '/profile',
        element: <ProtectedRoute allowedRoles={ALLOWED_ALL_ROLES} />,
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
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;