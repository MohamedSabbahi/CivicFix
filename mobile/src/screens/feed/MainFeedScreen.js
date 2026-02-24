import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import ReportCard from '../../components/ReportCard';
import { AuthContext } from '../../context/AuthContext';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function MainFeedScreen({ navigation }){

    const { logout, userInfo } = useContext(AuthContext);

    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isChatModalVisible, setIsChatModalVisible] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    const fetchReports = async (lat = null, lng = null) => {
        try{
            let endpoint = "/reports";
            if (lat && lng) {
                endpoint = `/reports/nearby?latitude=${lat}&longitude=${lng}&radius=15`;
            }
            const response = await api.get(endpoint);
            setReports(response.data.data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const getPermissionsAndLoadFeed = async () => {
        setIsLoading(true);
        try {
            // Ask for GPS permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                // Fallback: Fetch general reports if they say no
                await fetchReports(); 
                return;
            }

            // Grab the actual coordinates
            let locationData = await Location.getCurrentPositionAsync({});
            setUserLocation(locationData.coords);

            // Fetch reports, passing the coordinates to the API!
            await fetchReports(locationData.coords.latitude, locationData.coords.longitude);

        } catch (error) {
            console.error("Location error:", error);
            await fetchReports(); // Fallback on error
        }
    };

    const handleCreateReportFlow = async () => {
        // 1. Ask for Camera Permissions
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
            alert('We need camera permissions to capture the issue.');
            return;
        }

        // 2. Launch the Native Camera with 0.4 compression for the 5MB limit
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'], 
            quality: 0.4, 
        });

        // 3. If they took a picture, navigate to the next screen!
        if (!result.canceled) {
            navigation.navigate('CreateReport', { 
                photoUri: result.assets[0].uri,
                latitude: userLocation?.latitude,
                longitude: userLocation?.longitude
            });
        }
    };

// Change this to call the new function instead of fetchReports()
    useEffect(() => {
        getPermissionsAndLoadFeed();
    }, []);

    // Update this to use the saved location
    const onRefresh = () => {
        setIsRefreshing(true);
        if (userLocation) {
            // Re-fetch using the coordinates we already have
            fetchReports(userLocation.latitude, userLocation.longitude);
        } else {
            // If we don't have location yet, try to get it
            getPermissionsAndLoadFeed();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
        
        {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 bg-background-dark">
                {/* 4. FIX: Change navigation.openDrawer() to setIsSidebarVisible(true) */}
                <TouchableOpacity 
                    onPress={() => setIsSidebarVisible(true)} 
                    className="p-2 -ml-2 rounded-full active:bg-slate-800"
                >
                    <MaterialIcons name="menu" size={28} color="#fff" />
                </TouchableOpacity>
                
                <Text className="text-white text-xl font-bold tracking-wide">CivicFix Feed</Text>
                
                <TouchableOpacity className="p-2 -mr-2 rounded-full active:bg-slate-800">
                    <MaterialIcons name="filter-list" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

        {/* Feed List */}
        {isLoading ? (
            <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#137fec" />
            </View>
        ) : (
            <FlatList
            data={reports}
            keyExtractor={(item) => item.id.toString()}
            // Use your extracted component here!
            renderItem={({ item }) => <ReportCard item={item} />} 
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#137fec" colors={['#137fec']} />
            }
            ListEmptyComponent={() => (
                <View className="items-center justify-center py-20">
                <MaterialIcons name="inbox" size={64} color="#334155" />
                <Text className="text-slate-400 text-lg mt-4 font-medium">No reports found in your area.</Text>
                </View>
            )}
            />
        )}

        {/* FAB */}
        <TouchableOpacity 
            className="absolute bottom-6 left-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95"
            onPress={handleCreateReportFlow}
        >
            <MaterialIcons name="add" size={30} color="#fff" />
        </TouchableOpacity>

        {/* ── FAB: NLP Chatbot (Placed on Right) ── */}
        <TouchableOpacity 
            className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-500 rounded-full items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95"
            onPress={() => setIsChatModalVisible(true)}
        >
            <MaterialIcons name="smart-toy" size={30} color="#fff" />
        </TouchableOpacity>

        {/* ── Custom Sidebar Drawer (Left Slide) ── */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={isSidebarVisible}
            onRequestClose={() => setIsSidebarVisible(false)}
        >
            <View className="flex-1 flex-row">
                
                {/* 1. The Visual Backdrop (Just color, no clicks) */}
                <View className="absolute inset-0 bg-black/60" />
                
                {/* 2. The Sidebar Content (Left Side) */}
                <View className="w-[280px] h-full bg-[#0f172a] shadow-2xl p-6 pt-24 flex-col z-10">
                    
                    {/* ── User Profile Section ── */}
                    <View className="mb-8 px-2">
                        <Text className="text-white text-xl font-bold capitalize">
                            {userInfo?.name || 'User Name'}
                        </Text>
                        <Text className="text-slate-400 text-sm mt-1">
                            {userInfo?.email || 'user@email.com'}
                        </Text>
                    </View>

                    <View className="h-[1px] bg-slate-800 mb-6" />

                    {/* ── Navigation Links ── */}
                    <View className="gap-y-2">
                        <TouchableOpacity 
                            className="flex-row items-center px-4 py-3.5 bg-[#1e293b] rounded-xl"
                            onPress={() => setIsSidebarVisible(false)}
                        >
                            <MaterialIcons name="grid-view" size={24} color="#3b82f6" />
                            <Text className="text-[#3b82f6] font-bold text-[17px] ml-4 mt-0.5">Community Feed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center px-4 py-3.5 rounded-xl active:bg-slate-800">
                            <MaterialIcons name="assignment" size={24} color="#cbd5e1" />
                            <Text className="text-slate-200 font-medium text-[17px] ml-4 mt-0.5">My Reports</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center px-4 py-3.5 rounded-xl active:bg-slate-800">
                            <MaterialIcons name="settings" size={24} color="#cbd5e1" />
                            <Text className="text-slate-200 font-medium text-[17px] ml-4 mt-0.5">Settings</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Bottom Section: Log Out ── */}
                    <View className="mt-auto border-t border-slate-800 pt-6">
                        <TouchableOpacity 
                            onPress={logout} 
                            className="flex-row items-center px-4 py-3.5 rounded-xl active:bg-red-500/10"
                        >
                            <MaterialIcons name="logout" size={24} color="#ef4444" />
                            <Text className="text-[#ef4444] font-bold text-[17px] ml-4 mt-0.5">Log Out</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* 3. The Clickable Area (Right Side) 
                    This invisible button stretches to fill the rest of the screen! 
                */}
                <TouchableOpacity 
                    className="flex-1 z-10" 
                    activeOpacity={1} 
                    onPress={() => setIsSidebarVisible(false)} 
                />

            </View>
        </Modal>
        {/* ── Chatbot Bottom Sheet (Slide Up Modal) ── */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={isChatModalVisible}
            onRequestClose={() => setIsChatModalVisible(false)}
        >
            <View className="flex-1 justify-end">
            
            {/* Backdrop */}
            <TouchableOpacity 
                className="absolute inset-0 bg-black/60" 
                activeOpacity={1} 
                onPress={() => setIsChatModalVisible(false)} 
            />
            
            {/* The Main Drawer Container 
                (overflow-hidden ensures the header respects the rounded top corners)
            */}
            <View className="h-[60%] bg-slate-900 rounded-t-3xl overflow-hidden shadow-2xl border-t border-slate-700">
                
                {/* ── Chat Header (Distinct Background Color) ── */}
                <View className="bg-slate-800 px-5 py-4 flex-row justify-between items-center border-b border-slate-700/50">
                
                {/* Left Side: Avatar & Info */}
                <View className="flex-row items-center gap-3">
                    
                    {/* Robot Avatar with Absolute Status Dot */}
                    <View className="relative">
                    <View className="w-12 h-12 bg-slate-700/80 rounded-full items-center justify-center border border-indigo-500/30">
                        <MaterialIcons name="smart-toy" size={26} color="#818cf8" />
                    </View>
                    {/* The overlapping green dot */}
                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-800" />
                    </View>

                    {/* Text Block */}
                    <View>
                    <Text className="text-white text-lg font-bold tracking-wide">Civic Assistant</Text>
                    <View className="flex-row items-center gap-1.5 mt-0.5">
                        {/* Small inline green dot */}
                        <View className="w-2 h-2 bg-green-500 rounded-full" />
                        <Text className="text-slate-400 text-sm font-medium">Online</Text>
                    </View>
                    </View>

                </View>

                {/* Right Side: Window Controls */}
                <View className="flex-row items-center">
                    <TouchableOpacity 
                    onPress={() => setIsChatModalVisible(false)}
                    className="p-2 -mr-2" // Adds a nice hit-box for the thumb
                    >
                    <MaterialIcons name="close" size={26} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                </View>

                {/* ── Chat Body Area ── */}
                <View className="flex-1 p-6 items-center justify-center bg-slate-900">
                <MaterialIcons name="forum" size={48} color="#334155" />
                <Text className="text-slate-500 text-center text-base mt-4 leading-relaxed max-w-[80%]">
                    NLP Chatbot interface will go here. Ready to process natural language!
                </Text>
                </View>

            </View>
            </View>
        </Modal>

        </SafeAreaView>
    );
}