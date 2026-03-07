import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function MyReportCard({ item }) {
    const navigation = useNavigation();

    // Format the date cleanly (e.g., "12 Oct 2025")
    const date = new Date(item.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // Dynamic styling based on the report's current status
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
    
    // Construct the full image URL assuming the backend returns a relative path like /uploads/image.jpg
    const imageUrl = item.photoUrl ? `${BASE_URL}${item.photoUrl}` : null;

    return (
        <TouchableOpacity 
            className="bg-slate-900 rounded-2xl p-3 mb-6 border border-slate-800 flex-row gap-4 shadow-sm shadow-black/40 active:bg-slate-800"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ReportDetail', { report: item })}
        >
            {/* ── Thumbnail Image ── */}
            <View className="w-24 h-24 rounded-xl bg-[#0f172a] overflow-hidden border border-slate-700 items-center justify-center">
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <MaterialIcons name="image" size={32} color="#334155" />
                )}
            </View>

            {/* ── Report Details ── */}
            <View className="flex-1 justify-between py-1">
                <View>
                    <Text className="text-white font-bold text-base mb-0.5" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text className="text-slate-400 text-xs mb-1.5 flex-row items-center">
                        {item.category?.name || 'General Issue'} • {date}
                    </Text>
                    <Text className="text-slate-400 text-sm leading-5" numberOfLines={2}>
                        {item.description || "No description provided."}
                    </Text>
                </View>

                {/* ── Status Badge & Options ── */}
                <View className="flex-row items-center justify-between mt-2">
                    <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${badge.bg}`}>
                        <MaterialIcons name={badge.icon} size={14} color={badge.iconColor} />
                        <Text className={`text-[11px] font-bold ml-1.5 tracking-wider ${badge.text}`}>
                            {item.status === 'IN_PROGRESS' ? 'IN PROGRESS' : (item.status || 'PENDING')}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}