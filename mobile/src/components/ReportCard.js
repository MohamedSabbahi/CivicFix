import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native'; 
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ReportCard({ item }){
    const navigation = useNavigation();

    const getStatusBadge = (status) => {
        switch(status) {
            case 'RESOLVED': 
                return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', icon: 'check-circle', iconColor: '#34d399' };
            case 'IN_PROGRESS': 
                return { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400', icon: 'build', iconColor: '#fb923c' };
            default: 
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
                    source={{ uri: item.photoUrl.trim() }}// expo-image can take the string directly
                    style={{ width: '100%', height: 192, backgroundColor: '#1e293b' }}
                    contentFit="cover" // Note: This changed from resizeMode
                    transition={500} // Adds a smooth 0.5s fade-in when the image loads!
                />
            )}

            <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-white font-bold text-lg flex-1 mr-2" numberOfLines={1}>
                        {item.title}
                    </Text>
                    
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