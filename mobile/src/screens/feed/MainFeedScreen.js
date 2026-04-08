import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Modal, TextInput, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import ReportCard from '../../components/ReportCard';
import { AuthContext } from '../../context/AuthContext';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function MainFeedScreen({ navigation }){

    const { userInfo } = useContext(AuthContext);

    const [reports, setReports] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Ephemeral UX Tooltip State ---
    const [showTooltip, setShowTooltip] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchReports = async (lat = null, lng = null, search = '', categoryId = null) => {
        setIsLoading(true);
        try {
            const isSearching = search && search.trim().length >= 3;
            const endpoint = (lat && lng && !isSearching) ? '/reports/nearby' : '/reports';

            const params = {};

            if (endpoint === '/reports/nearby') {
                params.latitude = lat;
                params.longitude = lng;
                params.radius = 15;
            } else {
                if (lat && lng) {
                    params.user_lat = lat;
                    params.user_lng = lng;
                    params.sort = 'distance';
                }
                if (isSearching) {
                    params.search = search.trim();
                }
            }

            if (categoryId) {
                params.category_id = categoryId;
            }

            const response = await api.get(endpoint, { params });
            setReports(response.data.data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/reports/categories');
            const categoryData = response.data?.data || response.data || [];
            setCategories(categoryData);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const getPermissionsAndLoadFeed = async () => {
        setIsLoading(true);
        await fetchCategories();
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                await fetchReports(); 
                return;
            }

            let locationData = await Location.getCurrentPositionAsync({});
            setUserLocation(locationData.coords);

            await fetchReports(locationData.coords.latitude, locationData.coords.longitude);

        } catch (error) {
            console.error("Location error:", error);
            await fetchReports(); 
        }
    };

    const handleCreateReportFlow = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
            alert('We need camera permissions to capture the issue.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'], 
            allowsEditing: false, 
            quality: 0.3, 
        });

        if (!result.canceled) {
            navigation.navigate('CreateReport', { 
                photoUri: result.assets[0].uri,
                latitude: userLocation?.latitude,
                longitude: userLocation?.longitude
            });
        }
    };

    useEffect(() => {
        getPermissionsAndLoadFeed();
    }, []);

    // --- UX Tooltip Animation Lifecycle ---
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => setShowTooltip(false));
        }, 6000);

        return () => clearTimeout(timer);
    }, [fadeAnim]);

    const handleCategorySelect = (categoryId) => {
        setSelectedCategoryId(categoryId);
        fetchReports(userLocation?.latitude, userLocation?.longitude, searchQuery, categoryId);
    };

    const onRefresh = () => {
        setIsRefreshing(true);
        if (userLocation) {
            fetchReports(userLocation.latitude, userLocation.longitude, searchQuery, selectedCategoryId);
        } else {
            getPermissionsAndLoadFeed();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-background-dark">
            <TouchableOpacity 
                onPress={() => setIsSidebarVisible(true)} 
                className="p-2 -ml-2 rounded-full active:bg-slate-800"
            >
                <MaterialIcons name="menu" size={28} color="#fff" />
            </TouchableOpacity>
            
            <Text className="text-white text-xl font-bold tracking-wide flex-1 text-center pr-8">
                CivicFix
            </Text>
        </View>

        {/* ── Search Bar ── */}
        <View className="px-6 py-2 bg-background-dark border-b border-slate-800">
            <View className="flex-row items-center bg-slate-900 rounded-xl border border-slate-700 px-4 h-12">
                <MaterialIcons name="search" size={20} color="#64748b" />
                <TextInput
                    className="flex-1 ml-3 text-white"
                    placeholderTextColor="#64748b"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={() => fetchReports(userLocation?.latitude, userLocation?.longitude, searchQuery, selectedCategoryId)}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { 
                        setSearchQuery(''); 
                        fetchReports(userLocation?.latitude, userLocation?.longitude, '', selectedCategoryId); 
                    }}>
                        <MaterialIcons name="close" size={20} color="#64748b" />
                    </TouchableOpacity>
                )}
            </View>
        </View>

        {/* ── Category Pill Filters ── */}
        <View className="bg-background-dark border-b border-slate-800 pb-3">
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, gap: 10 }}
            >
                {/* 'ALL' Button */}
                <TouchableOpacity 
                    onPress={() => handleCategorySelect(null)}
                    className={`px-5 py-2.5 rounded-full border ${selectedCategoryId === null ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-transparent border-slate-700'}`}
                >
                    <Text className={`font-bold tracking-wider text-sm ${selectedCategoryId === null ? 'text-white' : 'text-slate-400'}`}>ALL</Text>
                </TouchableOpacity>

                {/* Dynamic Category Buttons */}
                {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                        <TouchableOpacity 
                            key={cat.id}
                            onPress={() => handleCategorySelect(cat.id)}
                            className={`px-5 py-2.5 rounded-full border ${isSelected ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-transparent border-slate-700'}`}
                        >
                            <Text className={`font-bold tracking-wider text-sm uppercase ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
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
                renderItem={({ item }) => <ReportCard item={item} />} 
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#137fec" />
                }
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-20">
                        <MaterialIcons name="inbox" size={64} color="#334155" />
                        <Text className="text-slate-400 text-lg mt-4 font-medium">No reports found.</Text>
                    </View>
                )}
            />
        )}

        {/* Manual Report FAB */}
        <TouchableOpacity 
            className="absolute bottom-6 left-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95"
            onPress={handleCreateReportFlow}
        >
            <MaterialIcons name="add" size={30} color="#fff" />
        </TouchableOpacity>

        {/* NLP Chatbot FAB with Ephemeral UX Tooltip */}
        <View className="absolute bottom-6 right-6 items-end z-50">
            {showTooltip && (
                <Animated.View style={{ opacity: fadeAnim }} className="mb-3 mr-2">
                    <View className="bg-indigo-600 rounded-2xl p-3 shadow-lg shadow-black/30 max-w-[220px]">
                        <Text className="text-white font-medium text-sm leading-5">
                            Hi! Need to report an issue or check city stats? I can help! ✨
                        </Text>
                        <View className="absolute -bottom-2 right-4 w-4 h-4 bg-indigo-600 transform rotate-45" />
                    </View>
                </Animated.View>
            )}
            <TouchableOpacity 
                className="w-14 h-14 bg-indigo-500 rounded-full items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95"
                onPress={() => {
                    setShowTooltip(false);
                    // Pass userName to ChatbotScreen to enable personalized greetings
                    navigation.navigate('Chatbot', { userName: userInfo?.name }); 
                }}
            >
                <MaterialIcons name="smart-toy" size={30} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* ── Custom Sidebar Drawer (Left Slide) ── */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={isSidebarVisible}
            onRequestClose={() => setIsSidebarVisible(false)}
        >
            <View className="flex-1 flex-row">
                
                {/* Visual Backdrop */}
                <View className="absolute inset-0 bg-black/60" />
                
                {/* Sidebar Content (Left Side) */}
                <View className="w-[280px] h-full bg-[#0f172a] shadow-2xl p-6 pt-24 flex-col z-10">
                    
                    {/* User Profile Section */}
                    <View className="mb-8 px-2">
                        <Text className="text-white text-xl font-bold capitalize">
                            {userInfo?.name || 'User Name'}
                        </Text>
                        <Text className="text-slate-400 text-sm mt-1">
                            {userInfo?.email || 'user@email.com'}
                        </Text>
                    </View>

                    <View className="h-[1px] bg-slate-800 mb-6" />

                    {/* Navigation Links */}
                    <View className="gap-y-2">
                        <TouchableOpacity 
                            className="flex-row items-center px-4 py-3.5 bg-[#1e293b] rounded-xl"
                            onPress={() => setIsSidebarVisible(false)}
                        >
                            <MaterialIcons name="grid-view" size={24} color="#3b82f6" />
                            <Text className="text-[#3b82f6] font-bold text-[17px] ml-4 mt-0.5">Community Feed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            className="flex-row items-center px-4 py-3.5 rounded-xl active:bg-slate-800"
                            onPress={() => {
                                setIsSidebarVisible(false);
                                navigation.navigate('MyReports');
                            }}
                        >
                            <MaterialIcons name="assignment" size={24} color="#cbd5e1" />
                            <Text className="text-slate-200 font-medium text-[17px] ml-4 mt-0.5">My Reports</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => {
                                setIsSidebarVisible(false);
                                navigation.navigate('Settings');
                            }} 
                            className="flex-row items-center px-4 py-3.5 rounded-xl active:bg-slate-800"
                        >
                            <MaterialIcons name="settings" size={24} color="#cbd5e1" />
                            <Text className="text-slate-200 font-medium text-[17px] ml-4 mt-0.5">Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Clickable Overlay for Dismissal */}
                <TouchableOpacity 
                    className="flex-1 z-10" 
                    activeOpacity={1} 
                    onPress={() => setIsSidebarVisible(false)} 
                />

            </View>
        </Modal>
        </SafeAreaView>
    );
}