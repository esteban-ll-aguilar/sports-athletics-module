import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '@modules/auth/services/auth_service';

import { getUserRole } from '@modules/auth/utils/roleUtils';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const isAuthenticated = authService.isAuthenticated();
    const userRole = getUserRole();

    console.log("ProtectedRoute Debug:", { isAuthenticated, userRole, allowedRoles });

    if (!isAuthenticated) {
        console.warn("User not authenticated, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
