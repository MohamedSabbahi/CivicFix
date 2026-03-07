import React, { useContext, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, isLoading } = useContext(AuthContext);

  const handleRegister = () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    register(name, email, password);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Header with Back Arrow ── */}
          <View className="flex-row items-center mt-2 mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white ml-2">
              Join CivicFix
            </Text>
          </View>

          {/* ── Icon + Title ── */}
          <View className="mb-6">
            <View className="bg-primary/10 p-3 rounded-xl mb-3 self-start">
              <MaterialIcons name="person" size={32} color="#137fec" />
            </View>
            <Text className="text-2xl font-bold text-white">Create Account</Text>
            <Text className="text-slate-500 mt-1 text-sm">
              Join thousands of citizens making their{'\n'}neighborhoods better, one report at a time.
            </Text>
          </View>

          {/* ── Full Name ── */}
          <Text className="text-white font-semibold mb-2">Full Name</Text>
          <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14 mb-4">
            <MaterialIcons name="person-outline" size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-3 text-white"
              placeholderTextColor="#64748b"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              textContentType="name"
              autoComplete="name"
            />
          </View>

          {/* ── Email ── */}
          <Text className="text-white font-semibold mb-2">Email Address</Text>
          <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14 mb-4">
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

          {/* ── Password ── */}
          <Text className="text-white font-semibold mb-2">Password</Text>
          <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14 mb-4">
            <MaterialIcons name="lock-outline" size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-3 text-white"
              placeholderTextColor="#64748b"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              autoComplete="password-new"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          {/* ── Confirm Password ── */}
          <Text className="text-white font-semibold mb-2">Confirm Password</Text>
          <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14">
            <MaterialIcons name="security" size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-3 text-white"
              placeholderTextColor="#64748b"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              textContentType="newPassword"
              autoComplete="password-new"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <MaterialIcons
                name={showConfirm ? 'visibility' : 'visibility-off'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          {/* ── Password hint ── */}
          <Text className="text-slate-500 text-xs mt-2">
            Must be at least 8 characters with one special character.
          </Text>

          {/* ── Terms ── */}
          <Text className="text-slate-500 text-xs text-center mt-4">
            By creating an account, you agree to our{' '}
            <Text className="text-primary">Terms of Service</Text>
            {' '}and{' '}
            <Text className="text-primary">Privacy Policy</Text>.
          </Text>

          {/* ── Create Account Button ── */}
          <TouchableOpacity
            onPress={handleRegister}
            className="bg-primary h-14 justify-center items-center rounded-xl mt-6 mb-8"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Create Account</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}