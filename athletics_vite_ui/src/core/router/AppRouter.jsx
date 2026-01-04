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

import ProfilePage from '@modules/auth/ui/pages/ProfilePage';
// Seguridad
import ProtectedRoute from './ProtectedRoute';
import ResultadosPage from '../../modules/competencia/ui/pages/ResultadosPage';
import AthletesTable from '../../modules/atleta/ui/pages/atletlas';


const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },

  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },


  {
    path: '/dashboard',
    element: <ProtectedRoute />, 
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // /dashboard
          { index: true, element: <DashboardPage /> },

          // /dashboard/users
          {
            path: 'users',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />,
            children: [{ index: true, element: <UserRoleManagementPage /> }],
          },

          // /dashboard/admin
          {
            path: 'admin',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR']} />,
            children: [{ index: true, element: <AdminUsersTable /> }],
          },

          // /dashboard/pruebas
          {
            path: 'pruebas',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENTRENADOR']} />,
            children: [
              { index: true, element: <PruebasPage /> },
              { path: 'baremos', element: <BaremosPage /> },
              { path: 'disciplinas', element: <TipoDisciplinaPage /> },
            ],
          },

          // /dashboard/competitions
          {
            path: 'competitions',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENTRENADOR']} />,
            children: [{ index: true, element: <CompetenciasPage /> }],
          },
          // /dashboard/results

          {
            path: 'results',
            element: <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENTRENADOR',]} />,
            children: [{ index: true, element: <ResultadosPage /> }],
          },

          {
          path: 'athletes',
          element: (
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ENTRENADOR']} />
          ),
          children: [
            { index: true, element: <AthletesTable /> }
          ],
        },
          
        ],
      },
    ],
  },

  /* =========================
     👤 PERFIL
  ========================== */
  {
    path: '/profile',
    element: <ProtectedRoute />,
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
