import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // We will need to add the 'register' function to your AuthContext in a moment!
  const { register, isLoading } = useContext(AuthContext);

  const handleRegister = () => {
    if (!name || !email || !password) {
      alert("Please fill in all fields");
      return;
    }
    // backend expects: { name, email, password }
    register(name, email, password); 
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-blue-600">Join CivicFix</Text>
            <Text className="text-gray-500 mt-2">Create an account to report issues</Text>
          </View>

          {/* Inputs */}
          <View className="space-y-4">
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200"
              placeholder="Password (Min 8 chars, 1 uppercase, 1 number)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            onPress={handleRegister}
            className="bg-blue-600 py-4 rounded-xl mt-8 shadow-sm"
          >
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text className="text-white text-center font-bold text-lg">Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Toggle to Login */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-blue-600 font-bold">Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}