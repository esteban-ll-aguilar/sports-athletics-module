import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';

// Layouts
import MainLayout from '@shared/components/MainLayout';
import DashboardLayout from '@modules/home/ui/dashboard/layouts/DashboardLayout';

// Páginas públicas
import HomePage from '@modules/home/ui/pages/HomePage';
import LoginPage from '@modules/auth/ui/pages/LoginPage';
import RegisterPage from '@modules/auth/ui/pages/RegisterPage';
import UnauthorizedPage from '@modules/auth/ui/pages/UnauthorizedPage';
import PasswordResetPage from '@modules/auth/ui/pages/PasswordResetPage';

// Proteccion
import ProtectedRoute from './ProtectedRoute';

// Dashboard pages
import DashboardPage from '@modules/home/ui/dashboard/pages/DashboardPage';

// Admin
import UserRoleManagementPage from '@modules/admin/ui/pages/UserRoleManagementPage';
import AdminUsersTable from '@modules/admin/ui/pages/admin_controller_user_ui';

// Competencia
import PruebasPage from '@modules/competencia/ui/pages/PruebasPage';
import BaremosPage from '@modules/competencia/ui/pages/BaremosPage';
import TipoDisciplinaPage from '@modules/competencia/ui/pages/TipoDisciplinaPage';
import CompetenciasPage from '@modules/competencia/ui/pages/CompetenciaPage';
import ResultadosPage from '@modules/competencia/ui/pages/ResultadosPage';

// Atleta
import AthletesTable from '@modules/atleta/ui/pages/atletlas';

// Entrenador
import GestionEntrenamientosPage from '@modules/entrenador/ui/pages/GestionEntrenamientosPage';
import GestionAsistenciaPage from '@modules/entrenador/ui/pages/GestionAsistenciaPage';

// Representante
import RegisterAthletePage from '@modules/representante/ui/pages/RegisterAthletePage';
import MisAtletasPage from '@modules/representante/ui/pages/MisAtletasPage';

// Profile
import ProfilePage from '@modules/auth/ui/pages/ProfilePage';

const ALLOWED_ALL_ROLES = ['ADMINISTRADOR', 'ENTRENADOR', 'ATLETA', 'REPRESENTANTE'];

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <PasswordResetPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },

  // Dashboard Routes
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // /dashboard
          { index: true, element: <DashboardPage /> },

          // --- ADMIN ROUTES ---
          {
            path: 'users',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />,
            children: [{ index: true, element: <UserRoleManagementPage /> }],
          },
          {
            path: 'admin',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />,
            children: [{ index: true, element: <AdminUsersTable /> }],
          },

          // --- COMPETENCIA / PRUEBAS ROUTES ---
          {
            path: 'pruebas',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENTRENADOR']} />,
            children: [
              { index: true, element: <PruebasPage /> },
              { path: 'baremos', element: <BaremosPage /> },
              { path: 'disciplinas', element: <TipoDisciplinaPage /> },
            ],
          },
          {
            path: 'competitions',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENTRENADOR']} />,
            children: [{ index: true, element: <CompetenciasPage /> }],
          },
          {
            path: 'results',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENTRENADOR']} />,
            children: [{ index: true, element: <ResultadosPage /> }],
          },

          // --- ATLETA ROUTES ---
          {
            path: 'athletes',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENTRENADOR']} />,
            children: [
              { index: true, element: <AthletesTable /> }
            ],
          },

          // --- ENTRENADOR ROUTES ---
          {
            path: 'entrenamientos',
            element: <ProtectedRoute allowedRoles={['ENTRENADOR']} />,
            children: [
              { index: true, element: <GestionEntrenamientosPage /> },
              { path: ':id/asistencia', element: <GestionAsistenciaPage /> },
            ],
          },

          // --- REPRESENTANTE ROUTES ---
          {
            path: 'representante',
            element: <ProtectedRoute allowedRoles={['REPRESENTANTE']} />,
            children: [
              { path: 'mis-atletas', element: <MisAtletasPage /> },
              { path: 'register-athlete', element: <RegisterAthletePage /> }
            ]
          }

        ],
      },
    ],
  },

  /* =========================
     👤 PERFIL
  ========================== */
  {
    path: '/profile',
    element: <ProtectedRoute allowedRoles={ALLOWED_ALL_ROLES} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [{ index: true, element: <ProfilePage /> }],
      },
    ],
  },

  /* =========================
     🚫 FALLBACK
  ========================== */
  { path: '*', element: <Navigate to="/" replace /> },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
