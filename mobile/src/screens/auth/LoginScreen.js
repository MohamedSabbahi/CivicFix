import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext'; // Import the logic we just made

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useContext(AuthContext);

  return (
    <SafeAreaView className="flex-1 bg-background-dark justify-center px-6">
      
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-blue-600">CivicFix</Text>
        <Text className="text-gray-500 mt-2">Welcome Back!</Text>
      </View>

      {/* Inputs */}
      <View className="space-y-4">
        <TextInput
          className="bg-white p-4 rounded-xl border border-gray-200"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          className="bg-white p-4 rounded-xl border border-gray-200"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        {/* Forgot Password Link */}
        <TouchableOpacity>
            <Text className="text-right text-blue-500 text-sm">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity 
        onPress={() => login(email, password)}
        className="bg-blue-600 py-4 rounded-xl mt-8 shadow-sm"
      >
        {isLoading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text className="text-white text-center font-bold text-lg">Login</Text>
        )}
      </TouchableOpacity>

      {/* Toggle to Register */}
      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-500">Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="text-blue-600 font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}