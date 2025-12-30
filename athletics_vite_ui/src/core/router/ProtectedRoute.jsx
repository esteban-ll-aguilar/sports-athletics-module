import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '@modules/auth/services/auth_service';

import { getUserRole } from '@modules/auth/utils/roleUtils';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const isAuthenticated = authService.isAuthenticated();
    const userRole = getUserRole();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />; // ✅ CAMBIO
    }

    return <Outlet />;
};

export default ProtectedRoute;
