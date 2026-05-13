import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "token";
const USER_KEY = "user";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const initializeAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                setLoading(false);
                return;
            }

            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const storedUser = localStorage.getItem(USER_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            const { data } = await api.get("/auth/profile");
            setUser(data);
            localStorage.setItem(USER_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Auth initialization failed:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        initializeAuth();
    }, [initializeAuth]);

    const login = useCallback(async (credentials) => {
        const { data } = await api.post("/auth/login", credentials);
        const { token, user } = data;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(user);
        return user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
    }, []);

    const updateUser = useCallback((userData) => {
        setUser((prevUser) => {
            const updatedUser = { ...prevUser, ...userData };
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: !!user,
            login,
            logout,
            updateUser,
        }),
        [user, loading, login, logout, updateUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};
