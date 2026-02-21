import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in when app starts
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await SecureStore.getItemAsync('userToken');
      let userInfo = await SecureStore.getItemAsync('userInfo');

      if (token) {
        setUserToken(token);
        setUserInfo(JSON.parse(userInfo));
      }
      setIsLoading(false);
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  // The Login Function
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // connecting to your backend authRoutes.js -> router.post('/login', ...)
      const response = await api.post('/auth/login', { email, password });

      const { token, ...userData } = response.data;

      setUserToken(token);
      setUserInfo(userData);

      // Save to device storage
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));

    } catch (error) {
      console.log(error);
      alert('Login Failed: ' + (error.response?.data?.message || 'Something went wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  // The Register Function
  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, ...userData } = response.data;

      setUserToken(token);
      setUserInfo(userData);

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(userData));
    } catch (error) {
      console.log(error);
      alert('Registration Failed: ' + (error.response?.data?.message || 'Something went wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  // The Logout Function
  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userInfo');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ login, logout, register, isLoading, userToken, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};