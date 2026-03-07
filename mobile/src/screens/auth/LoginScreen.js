import React, { useContext, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useContext(AuthContext);

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
          onPress={() => navigation.navigate('ForgotPassword')} // Add this exact line!
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