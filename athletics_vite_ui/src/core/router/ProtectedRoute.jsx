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
        // Redirect to dashboard or unauthorized page if role is not allowed
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
