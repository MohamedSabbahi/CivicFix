import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import api from '../../services/api';

export default function CreateReportScreen({ route, navigation }) {
    // 1. Data passed from the Feed screen's camera flow
    const { photoUri, latitude, longitude } = route.params || {};

    // Fallback coordinates (e.g., center of Tetouan) if GPS was still loading
    const initialLat = latitude || 35.5889;
    const initialLng = longitude || -5.3626;

    // 2. Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Draggable Pin State
    const [markerCoordinate, setMarkerCoordinate] = useState({
        latitude: initialLat,
        longitude: initialLng,
    });

    // 3. Submit Handler with Pre-Flight Validation
    const handleSubmit = async () => {
        // Validation: Must have a photo
        if (!photoUri) {
            Alert.alert("Missing Photo", "Please snap a photo of the issue before submitting.");
            return;
        }

        // Validation: Must have a title
        if (!title.trim()) {
            Alert.alert("Missing Title", "Please provide a short title for the issue.");
            return;
        }

        // Validation: Description (Optional, but if provided, must be >= 10 chars)
        const descText = description.trim();
        if (descText.length > 0 && descText.length < 10) {
            Alert.alert("Description Too Short", "If you provide a description, it needs to be at least 10 characters long to be helpful.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 4. Construct Multipart FormData exactly as your backend expects
            const formData = new FormData();
            
            formData.append('title', title.trim());
            formData.append('description', descText);
            formData.append('latitude', markerCoordinate.latitude.toString());
            formData.append('longitude', markerCoordinate.longitude.toString());
            
            // Hardcoding categoryId to '1' for now. 
            // In the future, you can add a Dropdown picker to set this dynamically!
            formData.append('categoryId', '1'); 

            // Append the image file. The key 'image' matches upload.single('image')
            const filename = photoUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('image', {
                uri: photoUri,
                name: filename,
                type,
            });

            // 5. Fire off the request!
            await api.post('/reports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Success! Return to the feed so the user can see their new post
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
                {/* ── Header ── */}
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
                    
                    {/* ── Image & Title Row ── */}
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

                    {/* ── Dynamic Description Section ── */}
                    <View className="flex-row items-center justify-between ml-1 mb-2">
                        <Text className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                            Additional Details
                        </Text>
                        {/* Dynamic Character Counter Text */}
                        <Text className={`text-xs font-medium ${description.length > 0 && description.trim().length < 10 ? 'text-red-400' : 'text-slate-500'}`}>
                            {description.length > 0 ? `${description.trim().length}/10 min` : '(Optional)'}
                        </Text>
                    </View>
                    
                    <TextInput
                        // Dynamic Border Color
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

                    {/* ── Interactive Map Section ── */}
                    <View className="flex-row items-center justify-between mb-3 ml-1 mt-2">
                        <Text className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                            Confirm Location
                        </Text>
                        <View className="flex-row items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                            <MaterialIcons name="touch-app" size={14} color="#60a5fa" />
                            <Text className="text-blue-400 text-xs font-semibold">Hold pin to drag</Text>
                        </View>
                    </View>
                    
                    <View className="h-[280px] rounded-2xl overflow-hidden border border-slate-700 mb-12 shadow-lg shadow-black/40">
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: initialLat,
                                longitude: initialLng,
                                latitudeDelta: 0.005, // Controls the zoom level (0.005 is roughly neighborhood level)
                                longitudeDelta: 0.005,
                            }}
                        >
                            <Marker
                                coordinate={markerCoordinate}
                                draggable
                                onDragEnd={(e) => setMarkerCoordinate(e.nativeEvent.coordinate)}
                            />
                        </MapView>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}