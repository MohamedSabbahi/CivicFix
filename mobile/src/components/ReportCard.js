import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../services/api.js';

export default function ReportCard({ item }){
    const navigation = useNavigation();

    // The unified status badge logic!
    const getStatusBadge = (status) => {
        switch(status) {
            case 'RESOLVED': 
                return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', icon: 'check-circle', iconColor: '#34d399' };
            case 'IN_PROGRESS': 
                return { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400', icon: 'build', iconColor: '#fb923c' };
            default: // PENDING
                return { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: 'pending', iconColor: '#f87171' };
        }
    };

    const badge = getStatusBadge(item.status);

    return (
        <TouchableOpacity 
            className="bg-slate-900 rounded-2xl mb-5 overflow-hidden border border-slate-800 shadow-sm shadow-black/40"
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ReportDetail', { report: item })}
        >
            {item.photoUrl && (
                <Image 
                    source={{ uri: `${BASE_URL}${item.photoUrl}` }} 
                    className="w-full h-48 bg-slate-800"
                    resizeMode="cover"
                />
            )}

            <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-white font-bold text-lg flex-1 mr-2" numberOfLines={1}>
                        {item.title}
                    </Text>
                    
                    {/* ── The new, cohesive Status Badge ── */}
                    <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${badge.bg}`}>
                        <MaterialIcons name={badge.icon} size={14} color={badge.iconColor} />
                        <Text className={`text-[11px] font-bold ml-1.5 tracking-wider ${badge.text}`}>
                            {item.status === 'IN_PROGRESS' ? 'IN PROGRESS' : (item.status || 'PENDING')}
                        </Text>
                    </View>
                </View>

                <Text className="text-slate-400 text-sm mb-3 leading-5" numberOfLines={2}>
                    {item.description}
                </Text>

                <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-slate-800">
                    <View className="flex-row items-center">
                        <MaterialIcons name="category" size={14} color="#64748b" />
                        <Text className="text-slate-500 text-xs ml-1.5 font-medium">
                            {item.category?.name || 'General'}
                        </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                        <MaterialIcons name="person" size={14} color="#64748b" />
                        <Text className="text-slate-500 text-xs ml-1.5 font-medium">
                            {item.user?.name || 'Citizen'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}