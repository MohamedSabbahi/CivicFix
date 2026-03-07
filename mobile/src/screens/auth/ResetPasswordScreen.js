import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';

export default function ResetPasswordScreen({ navigation }){
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState(''); // State is here
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if(!token.trim() || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if(newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try{
            const response = await api.put(`/auth/resetPassword/${token.trim()}`, { 
                password: newPassword 
            });
            
            Alert.alert('Success', 'Password reset successfully!', [{
                text: 'OK',
                onPress: () => navigation.navigate('Login'),
            }]);
        }catch(error){
            console.log(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to reset password. Please try again.');
        }finally {
            setIsLoading(false);
        }
    }

    return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32, paddingTop: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* ── Header Area ── */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <MaterialIcons name="password" size={48} color="#137fec" />
          </View>
          
          <Text className="text-3xl font-bold tracking-tight text-white text-center">
            Create New Password
          </Text>
          
          <Text className="mt-4 text-center text-slate-400 leading-relaxed px-2">
            Paste the token sent to your email and enter your new password below.
          </Text>
        </View>

        {/* ── Form Area ── */}
        <View className="flex-grow space-y-5">
          
          {/* Token Input */}
          <View className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 mb-2">
              Reset Token
            </Text>
            <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14">
              <MaterialIcons name="vpn-key" size={20} color="#64748b" />
              <TextInput
                className="flex-1 ml-3 text-white"
                placeholderTextColor="#64748b"
                placeholder="Paste your token here"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* New Password Input */}
          <View className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 mb-2 mt-4">
              New Password
            </Text>
            <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14">
              <MaterialIcons name="lock-outline" size={20} color="#64748b" />
              <TextInput
                className="flex-1 ml-3 text-white"
                placeholderTextColor="#64748b"
                placeholder="Enter new password"
                value={newPassword} // FIXED: Using newPassword
                onChangeText={setNewPassword} // FIXED: Using setNewPassword
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 mb-2 mt-4">
              Confirm Password
            </Text>
            <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14">
              <MaterialIcons name="lock" size={20} color="#64748b" />
              <TextInput
                className="flex-1 ml-3 text-white"
                placeholderTextColor="#64748b"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            className="w-full bg-primary h-14 rounded-xl shadow-lg shadow-primary/20 flex-row items-center justify-center mt-6 active:scale-95"
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              /* CHANGED THIS FROM <> TO A VIEW */
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-semibold text-lg">Update Password</Text>
                <MaterialIcons name="check-circle" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Footer Navigation ── */}
        <View className="pb-8 mt-12 flex items-center justify-center">
          <TouchableOpacity 
            className="flex-row items-center gap-2"
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <MaterialIcons name="close" size={20} color="#64748b" />
            <Text className="text-slate-400 font-medium text-base hover:underline">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}