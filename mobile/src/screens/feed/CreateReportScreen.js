import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import api from '../../services/api';

/**
 * Maps category names to corresponding Material Icons.
 * Provides a default fallback icon if no specific keyword match is found.
 */
const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('road')) return 'add-road';
    if (name.includes('waste') || name.includes('trash')) return 'delete-outline';
    if (name.includes('hazard')) return 'warning-amber';
    if (name.includes('graffiti')) return 'palette';
    if (name.includes('light')) return 'lightbulb-outline';
    return 'category'; 
};

export default function CreateReportScreen({ route, navigation }) {
    // Extracts standard camera flow data or AI-prefilled data passed via navigation routing
    const { 
        photoUri, 
        latitude, 
        longitude, 
        prefilledTitle, 
        prefilledDescription, 
        prefilledCategory 
    } = route.params || {};

    // Fallback coordinates (center of Tetouan) if device GPS is unavailable
    const initialLat = latitude || 35.5889;
    const initialLng = longitude || -5.3626;

    // Initialize form state, prioritizing prefilled AI data if available
    const [title, setTitle] = useState(prefilledTitle || '');
    const [description, setDescription] = useState(prefilledDescription || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    
    const [markerCoordinate, setMarkerCoordinate] = useState({
        latitude: initialLat,
        longitude: initialLng,
    });

    /**
     * Fetches available issue categories from the API on component mount.
     */
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/reports/categories');
                const categoryData = response.data?.data || response.data || [];
                setCategories(categoryData);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    /**
     * Auto-selects the appropriate category UI component based on AI-generated data.
     * Matches the string passed from the Chatbot against the database category records.
     */
    useEffect(() => {
        if (categories.length > 0 && prefilledCategory) {
            const matchedCat = categories.find(
                (cat) => cat.name?.toLowerCase() === prefilledCategory.toLowerCase()
            );
            
            if (matchedCat) {
                setSelectedCategoryId(matchedCat.id);
            }
        }
    }, [categories, prefilledCategory]);

    /**
     * Validates form data and constructs a multipart/form-data payload
     * to securely transmit text details and the image buffer to the backend.
     */
    const handleSubmit = async () => {
        if (!photoUri) {
            Alert.alert("Missing Photo", "Please snap a photo of the issue before submitting.");
            return;
        }

        if (!title.trim()) {
            Alert.alert("Missing Title", "Please provide a short title for the issue.");
            return;
        }

        if (!selectedCategoryId) {
            Alert.alert("Missing Category", "Please select a category that best fits the issue.");
            return;
        }

        const descText = description.trim();
        if (descText.length > 0 && descText.length < 10) {
            Alert.alert("Description Too Short", "If you provide a description, it needs to be at least 10 characters long to be helpful.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            
            formData.append('title', title.trim());
            formData.append('description', descText);
            formData.append('latitude', markerCoordinate.latitude.toString());
            formData.append('longitude', markerCoordinate.longitude.toString());
            formData.append('categoryId', selectedCategoryId.toString());

            // Extracts file extension and formats the image object for multer compatibility
            const filename = photoUri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('image', {
                uri: photoUri,
                name: filename,
                type,
            });

            await api.post('/reports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            navigation.goBack();

        } catch (error) {
            console.error("Upload error:", error.response?.data || error);
            Alert.alert("Upload Failed", "There was a problem submitting your report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0f172a]">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-800">
                        <MaterialIcons name="arrow-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    
                    <Text className="text-white text-lg font-bold">New Report</Text>
                    
                    {isSubmitting ? (
                        <ActivityIndicator color="#3b82f6" className="mr-2" />
                    ) : (
                        <TouchableOpacity onPress={handleSubmit} className="bg-blue-600 px-5 py-2 rounded-full active:bg-blue-700 shadow-lg shadow-blue-500/30">
                            <Text className="text-white font-bold">Post</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                    
                    {/* Header Image and Title Input */}
                    <View className="flex-row gap-4 mb-8 mt-2">
                        {photoUri ? (
                            <Image 
                                source={{ uri: photoUri }} 
                                className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700"
                            />
                        ) : (
                            <View className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center">
                                <MaterialIcons name="image" size={30} color="#64748b" />
                            </View>
                        )}
                        <TextInput
                            className="flex-1 bg-[#1e293b] text-white px-4 py-3 rounded-xl border border-slate-700 text-base"
                            placeholder="What's the issue?"
                            placeholderTextColor="#64748b"
                            value={title}
                            onChangeText={setTitle}
                            multiline
                        />
                    </View>

                    {/* Category Selection Carousel */}
                    <View className="mb-6">
                        <Text className="text-slate-400 text-sm font-bold uppercase tracking-wider ml-6 mb-3">
                            Category
                        </Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                        >
                            {categories.map((cat) => {
                                const isSelected = selectedCategoryId === cat.id;
                                return (
                                    <TouchableOpacity 
                                        key={cat.id}
                                        onPress={() => setSelectedCategoryId(cat.id)}
                                        className="items-center"
                                        activeOpacity={0.7}
                                    >
                                        <View className={`w-[72px] h-[72px] rounded-2xl items-center justify-center border-2 mb-2 ${isSelected ? 'bg-blue-500/10 border-[#3b82f6]' : 'bg-[#1e293b] border-slate-700'}`}>
                                            <MaterialIcons 
                                                name={getCategoryIcon(cat.name)} 
                                                size={30} 
                                                color={isSelected ? '#3b82f6' : '#94a3b8'} 
                                            />
                                        </View>
                                        <Text className={`text-xs font-semibold ${isSelected ? 'text-[#3b82f6]' : 'text-slate-400'}`}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <View className="px-5"></View>

                    {/* Description Input area */}
                    <View className="flex-row items-center justify-between ml-1 mb-2">
                        <Text className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                            Additional Details
                        </Text>
                        <Text className={`text-xs font-medium ${description.length > 0 && description.trim().length < 10 ? 'text-red-400' : 'text-slate-500'}`}>
                            {description.length > 0 ? `${description.trim().length}/10 min` : '(Optional)'}
                        </Text>
                    </View>
                    
                    <TextInput
                        className={`bg-[#1e293b] text-white px-4 py-4 rounded-xl border text-base min-h-[120px] mb-8 
                            ${description.length > 0 && description.trim().length < 10 ? 'border-red-500 shadow-sm shadow-red-500/20' : 'border-slate-700'}`
                        }
                        placeholder="Describe the problem to help authorities..."
                        placeholderTextColor="#64748b"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />

                    {/* Interactive Leaflet Map for coordinate adjustments */}
                    <View className="h-[280px] rounded-2xl overflow-hidden border border-slate-700 mb-12 shadow-lg shadow-black/40">
                        <WebView
                            style={{ flex: 1 }}
                            originWhitelist={['*']}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            onMessage={(event) => {
                                const { lat, lng } = JSON.parse(event.nativeEvent.data);
                                setMarkerCoordinate({ latitude: lat, longitude: lng });
                            }}
                            source={{
                                html: `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                                    <style>
                                        body { padding: 0; margin: 0; background-color: #0f172a; }
                                        #map { height: 100vh; width: 100vw; }
                                        .leaflet-layer,
                                        .leaflet-control-zoom-in,
                                        .leaflet-control-zoom-out,
                                        .leaflet-control-attribution {
                                            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div id="map"></div>
                                    <script>
                                        var map = L.map('map', { zoomControl: false }).setView([${initialLat}, ${initialLng}], 15);
                                        
                                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                            maxZoom: 19,
                                        }).addTo(map);

                                        var marker = L.marker([${initialLat}, ${initialLng}], {draggable: true}).addTo(map);
                                        
                                        marker.on('dragend', function(event) {
                                            var position = marker.getLatLng();
                                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                                lat: position.lat,
                                                lng: position.lng
                                            }));
                                        });
                                    </script>
                                </body>
                                </html>
                                `
                            }}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}