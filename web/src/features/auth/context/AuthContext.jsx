import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    const login = async (credentials) => {
        try {
            const data = await authService.login(credentials);
            setUser(data.user);
            setToken(data.token);
            navigate('/dashboard');
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
        navigate('/login');
    };

    const register = async (userData) => {
        try {
            const data = await authService.register(userData);
            setUser(data.user);
            setToken(data.token);
            navigate('/dashboard');
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const forgotPassword = async (email) => {
        try {
            return await authService.forgotPassword(email);
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const resetPassword = async (token, password) => {
        try {
            return await authService.resetPassword(token, password);
        } catch (error) {
            throw new Error(error.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, forgotPassword, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);