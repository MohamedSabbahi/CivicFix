import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [token, setToken] = useState(localStorage.getItem('token'));
    // ✅ FIX: Ajout du loading state manquant
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const login = async (credentials) => {
        try {
            setLoading(true);
            const data = await authService.login(credentials);
            setUser(data.user);
            setToken(data.token);
            // ✅ FIX: Redirection selon le rôle
            if (data.user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            throw new Error(error.message);
        } finally {
            // ✅ FIX: finally pour éviter spinner infini
            setLoading(false);
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
            setLoading(true);
            const data = await authService.register(userData);
            setUser(data.user);
            setToken(data.token);
            navigate('/');
        } catch (error) {
            throw new Error(error.message);
        } finally {
            // ✅ FIX: finally pour éviter spinner infini
            setLoading(false);
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

    const updateUser = (newData) => {
        const updated = { ...user, ...newData };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    return (
        // ✅ FIX: loading exposé dans le Provider
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            register,
            forgotPassword,
            resetPassword,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);