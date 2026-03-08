import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSplashLoading, setIsSplashLoading] = useState(true);

  // Check if user is already logged in when app starts
  const isLoggedIn = async () => {
    try {
      setIsSplashLoading(true);
      setIsLoading(true);
      let token = await SecureStore.getItemAsync('userToken');
      let userInfo = await SecureStore.getItemAsync('userInfo');

      if (token) {
        setUserToken(token);
        if (userInfo) {
            setUserInfo(JSON.parse(userInfo));
        }
      }
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    } finally{
      setIsLoading(false);
      setIsSplashLoading(false);
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

      const { token, user } = response.data;

      setUserToken(token);
      setUserInfo(user);

      // Save to device storage
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));

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
      const { token, user } = response.data;

      setUserToken(token);
      setUserInfo(user);

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(user));
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
    <AuthContext.Provider value={{ login, logout, register, isLoading, userToken, userInfo, isSplashLoading }}>
      {children}
    </AuthContext.Provider>
  );
};