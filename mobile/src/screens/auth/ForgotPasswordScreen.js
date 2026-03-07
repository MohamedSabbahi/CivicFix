import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';

export default function ForgotPasswordScreen({navigation}){
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
    

        setIsLoading(true);
        try{
            const response = await api.post('/auth/forgotPassword', { email });
            Alert.alert(
                'Check Your Email', 
                'We have sent a reset token to your email.', // <- ADD THIS MESSAGE
                [{
                    text: 'OK',
                    onPress: () => navigation.navigate('ResetPassword'),
                }]
            );
        } catch(error){
            console.log(error);
            Alert.alert('Error', 'Failed to send reset instructions. Please try again.');
        }finally {
            setIsLoading(false);
        }
    };

return(
    <SafeAreaView className="flex-1 bg-background-dark">
    <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32, paddingTop: 48 }}
        keyboardShouldPersistTaps="handled"
    >
        
        {/* ── Header Area ── */}
        <View className="items-center mb-12">
        <View className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <MaterialIcons name="lock-reset" size={48} color="#137fec" />
        </View>
        
        <Text className="text-3xl font-bold tracking-tight text-white text-center">
            Forgot Password?
        </Text>
        
        <Text className="mt-4 text-center text-slate-400 leading-relaxed px-2">
            Enter your email address to receive a password reset token.
        </Text>
        </View>

        {/* ── Form Area ── */}
        <View className="flex-grow space-y-6">
        
        <View className="space-y-2 mb-6">
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 mb-2">
            Email Address
            </Text>
            
            <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-14">
            <MaterialIcons name="mail-outline" size={20} color="#64748b" />
            <TextInput
                className="flex-1 ml-3 text-white"
                placeholderTextColor="#64748b"
                placeholder="citizen@civicfix.org"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                editable={!isLoading} 
            />
            </View>
        </View>

        <TouchableOpacity 
            className="w-full bg-primary h-14 rounded-xl shadow-lg shadow-primary/20 flex-row items-center justify-center mt-6 active:scale-95"
            onPress={handleForgotPassword}
            disabled={isLoading} 
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              // CHANGED TO A VIEW:
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-semibold text-lg">Send Reset Token</Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
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
            <MaterialIcons name="arrow-back" size={20} color="#137fec" />
            <Text className="text-primary font-medium text-base hover:underline">
            Back to Login
            </Text>
        </TouchableOpacity>
        </View>

    </ScrollView>
    </SafeAreaView>
);
}