import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

const PrivateRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check authentication status
        const checkAuth = () => {
            try {
                const auth = authService.isAuthenticated();
                console.log('Authentication check:', auth);
                setIsAuthenticated(auth);
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render protected routes
    return <Outlet />;
};

export default PrivateRoute;
