import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

  // Initialize auth state safely
    const initializeAuth = useCallback(async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
        setLoading(false);
        return;
        }

      // Optional: set default header
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const { data } = await api.get("/auth/profile");
        setUser(data);
    } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("token");
        setUser(null);
    } finally {
        setLoading(false);
    }
    }, []);

    useEffect(() => {
    initializeAuth();
    }, [initializeAuth]);

// 1. Fix login with useCallback
const login = useCallback(async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    const { token, user } = data;
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
    return user;
}, []);

const logout = useCallback(() => {
    localStorage.removeItem("token");
  localStorage.removeItem("user"); // ← add this
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
}, []);

// Update user state after profile changes
const updateUser = useCallback((userData) => {
    setUser((prevUser) => ({
        ...prevUser,
        ...userData,
    }));
}, []);

//  Memoize context value 
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

// Safer custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};