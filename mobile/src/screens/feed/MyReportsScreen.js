import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import ReportCard from '../../components/MyReportCard';
import { AuthContext } from '../../context/AuthContext';

export default function MyReportsScreen({ navigation }) {
    const { userInfo } = useContext(AuthContext);
    const [myReports, setMyReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchMyReports = async () => {
        try {
            // Extract user ID from the auth state safely
            const currentUserId = userInfo?.id || userInfo?.user?.id;
            
            // Abort fetch if user ID is missing
            if (!currentUserId) {
                console.warn("User ID not found in AuthContext");
                setIsLoading(false);
                setIsRefreshing(false);
                return;
            }

            // Fetch reports filtered by the user's ID
            const response = await api.get('/reports', { 
                params: { 
                    user_id: currentUserId,
                    limit: 50 
                } 
            });
            
            // Update state with the retrieved data
            setMyReports(response.data.data);
            
        } catch (error) {
            console.error("Error fetching my reports:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyReports();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchMyReports();
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0f172a]">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b mb-4 border-slate-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-800">
                    <MaterialIcons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold ml-2">My Reports</Text>
            </View>

            {/* List */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <FlatList
                    data={myReports}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <ReportCard item={item} />}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                    }
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-20">
                            <MaterialIcons name="assignment" size={64} color="#334155" />
                            <Text className="text-slate-400 text-lg mt-4 font-medium">You haven't posted any reports yet.</Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}