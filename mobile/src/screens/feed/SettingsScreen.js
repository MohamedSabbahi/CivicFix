import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
    const { userInfo, logout } = useContext(AuthContext);

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
            
            {/* Simple Header */}
            <View className="flex-row items-center px-6 py-4 bg-background-dark border-b border-slate-800">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    className="p-2 -ml-2 rounded-full active:bg-slate-800"
                >
                    <MaterialIcons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold tracking-wide flex-1 ml-4">
                    Settings
                </Text>
            </View>

            <View className="flex-1 p-6 justify-between">
                
                {/* User Profile Section (Matched exactly to Sidebar logic) */}
                <View className="mt-4">
                    <View className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <Text className="text-sm text-slate-400 mb-2 uppercase tracking-wider font-bold">Account</Text>
                        
                        {/* Exact same extraction method as the sidebar */}
                        <Text className="text-xl font-bold text-white capitalize">
                            {userInfo?.name || 'User Name'}
                        </Text>
                        <Text className="text-base text-slate-300 mt-1">
                            {userInfo?.email || 'user@email.com'}
                        </Text>
                    </View>
                </View>

                {/* Logout Button Section */}
                <View className="mb-8 border-t border-slate-800 pt-6">
                    <TouchableOpacity 
                        onPress={logout}
                        className="bg-red-500/10 border border-red-500/30 py-4 rounded-xl flex-row justify-center items-center active:bg-red-500/20"
                    >
                        <MaterialIcons name="logout" size={24} color="#ef4444" />
                        <Text className="text-[#ef4444] text-lg font-bold ml-3">Log Out</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        </SafeAreaView>
    );
}