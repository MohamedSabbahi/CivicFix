import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../services/api.js';

export default function ReportCard({ item }){
    const navigation = useNavigation();

    const statusColor = item.status === 'RESOLVED' ? 'text-emerald-400'
                                        : item.status === 'IN_PROGRESS' ? 'text-orange-400'
                                        : 'text-red-400';
                            
    return (
        <TouchableOpacity 
      className="bg-slate-900 rounded-2xl mb-5 overflow-hidden border border-slate-800"
      activeOpacity={0.9}
      onPress={() => console.log('Clicked report:', item.id)} // We can update this later
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
          <View className="bg-slate-800 px-2 py-1 rounded-md">
            <Text className={`text-xs font-bold ${statusColor}`}>
              {item.status || 'PENDING'}
            </Text>
          </View>
        </View>

        <Text className="text-slate-400 text-sm mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-slate-800">
          <View className="flex-row items-center">
            <MaterialIcons name="category" size={14} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1 font-medium">
              {item.category?.name || 'General'}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <MaterialIcons name="person" size={14} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1 font-medium">
              {item.user?.name || 'Citizen'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
    );
}