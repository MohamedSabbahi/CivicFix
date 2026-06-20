import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { AuthContext } from '../../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, isLoading } = useContext(AuthContext);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        loginWithGoogle(authentication.accessToken);
      }
    }
  }, [response]);

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Logo / Header ── */}
        <View className="items-center mb-8">
          <View className="bg-primary/10 p-4 rounded-xl mb-3">
            <MaterialIcons name="location-city" size={48} color="#137fec" />
          </View>
          <Text className="text-3xl font-bold text-white">CivicFix</Text>
          <Text className="text-slate-500 mt-1 text-sm">
            Your tool for a better community
          </Text>
          <Text className="text-xl font-bold text-white mt-6">Welcome Back</Text>
        </View>

        {/* ── Email Input ── */}
        <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14 mt-4 mb-4">
          <MaterialIcons name="email" size={20} color="#64748b" />
          <TextInput
            className="flex-1 ml-3 text-white"
            placeholderTextColor="#64748b"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
        </View>

        {/* ── Password Input ── */}
        <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14 mt-2">
          <MaterialIcons name="lock-outline" size={20} color="#64748b" />
          <TextInput
            className="flex-1 ml-3 text-white"
            placeholderTextColor="#64748b"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>

        {/* ── Forgot Password ── */}
        <TouchableOpacity
          className="self-end mt-2"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text className="text-primary text-sm font-medium">Forgot Password?</Text>
        </TouchableOpacity>

        {/* ── Login Button ── */}
        <TouchableOpacity
          onPress={() => login(email, password)}
          className="bg-primary h-14 justify-center items-center rounded-xl mt-6"
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Login</Text>
          )}
        </TouchableOpacity>

        {/* ── Divider ── */}
        <View className="flex-row items-center my-5">
          <View className="flex-1 h-px bg-slate-700" />
          <Text className="text-slate-500 mx-3 text-sm">OR</Text>
          <View className="flex-1 h-px bg-slate-700" />
        </View>

        {/* ── Google Sign In ── */}
        <TouchableOpacity
          onPress={() => promptAsync()}
          disabled={!request || isLoading}
          className="flex-row items-center justify-center bg-white h-14 rounded-xl gap-3"
          style={{ opacity: !request || isLoading ? 0.6 : 1 }}
        >
          <Image
            source={{ uri: 'https://www.svgrepo.com/show/475656/google-color.svg' }}
            style={{ width: 22, height: 22 }}
          />
          <Text className="text-black font-semibold text-base">Continue with Google</Text>
        </TouchableOpacity>

        {/* ── Register Link ── */}
        <View className="flex-row justify-center mt-6 mb-8">
          <Text className="text-slate-500">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-primary font-bold">Register</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
