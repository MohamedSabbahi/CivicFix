import React, { createContext, useContext, useState } from 'react';
import authService from '../../../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
        const [user, setUser] = useState(authService.getCurrentUser());
        const [token, setToken] = useState(localStorage.getItem("token"));
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
        const updateUser = (newData) => {
    const updated = { ...user, ...newData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
        };
    return (
    <AuthContext.Provider value={{ user, token, login, logout, register, updateUser }}>
        {children}
    </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);