import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '@modules/auth/services/auth_service';

const ProtectedRoute = () => {
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
