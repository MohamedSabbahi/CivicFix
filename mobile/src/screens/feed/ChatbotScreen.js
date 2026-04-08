import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api, { sendChatMessage } from '../../services/api'; 

export default function ChatbotScreen({ route, navigation }) {
    // Extract user information for personalized greeting
    const fullName = route.params?.userName || 'Citizen';
    const firstName = fullName.split(' ')[0];

    // --- State Management ---
    const [messages, setMessages] = useState([
        { 
            id: '1', 
            text: `Hi ${firstName}! I'm the CivicFix AI. What issue would you like to report, or what statistics would you like to see today?`, 
            sender: 'bot',
            type: 'text'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [requiresPhoto, setRequiresPhoto] = useState(false); 
    const [pendingReportData, setPendingReportData] = useState(null); 

    /**
     * Transmits user input to the AI microservice and routes the structured JSON response.
     */
    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user', type: 'text' };
        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const aiResponse = await sendChatMessage(userMsg.text);
            
            const botTextMsg = { 
                id: (Date.now() + 1).toString(), 
                text: aiResponse.bot_reply, 
                sender: 'bot',
                type: 'text'
            };
            let newMessages = [botTextMsg];

            // Route A: Statistics Request
            if (aiResponse.intent === 'GET_STATS') {
                newMessages.push({
                    id: (Date.now() + 2).toString(),
                    sender: 'bot',
                    type: 'stats_options'
                });
            }

            // Route B: High-Confidence Report (Hardware Handoff)
            if (aiResponse.intent === 'REPORT_ISSUE' && aiResponse.requires_photo === true) {
                setPendingReportData({ 
                    category: aiResponse.category, 
                    title: aiResponse.title,
                    description: aiResponse.description
                });
                
                setRequiresPhoto(true); 

                newMessages.push({
                    id: (Date.now() + 2).toString(),
                    sender: 'bot',
                    type: 'camera_trigger'
                });
            }

            setMessages((prev) => [...prev, ...newMessages]);

        } catch (error) {
            console.error("Chatbot Network Error:", error);
            const errorMsg = { 
                id: (Date.now() + 1).toString(), 
                text: "Sorry, I am having trouble connecting to the network right now. Please try again later.", 
                sender: 'bot',
                type: 'text'
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Executes authenticated API requests to the admin controllers and formats 
     * the raw SQL analytical data into readable chat bubbles.
     */
    const handleFetchStats = async (statType) => {
        setIsLoading(true);
        
        try {
            if (statType === 'performance') {
                const response = await api.get('/admin/departments/stats'); 
                const deptData = response.data;

                let statText = "📊 **Department Performance:**\n\n";
                deptData.forEach(dept => {
                    statText += `🏢 ${dept.department}\n`;
                    statText += `✅ Resolved: ${dept.resolvedReportsCount}\n`;
                    statText += `⏱️ Avg Time: ${dept.averageResolutionTime}\n\n`;
                });

                setMessages((prev) => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    type: 'text',
                    text: statText.trim()
                }]);

            } else if (statType === 'resolution') {
                const response = await api.get('/admin/overview'); 
                const overviewData = response.data.data;

                let statText = "📈 **Global Resolution Rates:**\n\n";
                statText += `📋 Total Reports: ${overviewData.totalReports}\n`;
                statText += `✅ Resolved: ${overviewData.resolvedReports} (${overviewData.resolutionRate})\n`;
                statText += `⏳ In Progress: ${overviewData.inProgressReports}\n`;
                statText += `⏱️ Platform Avg Time: ${overviewData.overallAverageTime}`;

                setMessages((prev) => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    type: 'text',
                    text: statText
                }]);
            }
        } catch (error) {
            console.error("Stats Fetch Error:", error);
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                type: 'text',
                text: "I am having trouble connecting to the analytics database right now. Please try again later."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Secures hardware permissions, captures environmental data, and 
     * injects the formal AI parameters into the CreateReport navigation state.
     */
    const handleTakePhoto = async () => {
        try {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

            if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
                Alert.alert('Permissions needed', 'We need camera and location access to submit a verified report!');
                return;
            }

            setIsLoading(true);

            const location = await Location.getCurrentPositionAsync({});
            
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'], 
                quality: 0.7,
            });

            if (!result.canceled) {
                setRequiresPhoto(false);
                
                navigation.navigate('CreateReport', {
                    photoUri: result.assets[0].uri,
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    prefilledCategory: pendingReportData.category,
                    prefilledDescription: pendingReportData.description,
                    prefilledTitle: pendingReportData.title
                });
            }
        } catch (error) {
            console.error("Camera/Location Error:", error);
            Alert.alert("Error", "Something went wrong while capturing the photo or location.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0f172a]">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            
            {/* Header Module */}
            <View className="items-center justify-center py-4 border-b border-slate-800">
                <Text className="text-white text-lg font-bold tracking-wide">CivicFix Assistant</Text>
            </View>

            <ScrollView className="flex-1 p-4 mb-20" contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 10 }}>
                
                {/* Dynamic Chat Rendering Engine */}
                {messages.map((msg) => {
                    if (msg.type === 'text') {
                        return (
                            <View key={msg.id} className={`mb-4 max-w-[80%] rounded-2xl p-4 ${
                                msg.sender === 'user' 
                                ? 'bg-blue-600 self-end rounded-br-sm shadow-md shadow-blue-900/20' 
                                : 'bg-[#1e293b] self-start rounded-bl-sm border border-slate-700 shadow-md shadow-black/20'
                            }`}>
                                <Text className={msg.sender === 'user' ? 'text-white' : 'text-slate-200 text-base leading-6'}>
                                    {msg.text}
                                </Text>
                            </View>
                        );
                    }

                    if (msg.type === 'stats_options') {
                        return (
                            <View key={msg.id} className="bg-[#1e293b] border border-slate-700 p-4 rounded-xl self-start mb-4 shadow-md shadow-black/20 max-w-[85%]">
                                <Text className="text-slate-200 mb-3 font-semibold">Select an analytical report to view:</Text>
                                <TouchableOpacity 
                                    onPress={() => handleFetchStats('performance')}
                                    className="bg-blue-600 p-3 rounded-lg mb-2 shadow-sm"
                                >
                                    <Text className="text-white text-center font-medium">📊 Department Performance</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => handleFetchStats('resolution')}
                                    className="bg-blue-600 p-3 rounded-lg shadow-sm"
                                >
                                    <Text className="text-white text-center font-medium">📈 Resolution Rates</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    if (msg.type === 'camera_trigger') {
                        return (
                            <View key={msg.id} className="self-center my-4 w-full px-2">
                                <TouchableOpacity 
                                    onPress={handleTakePhoto} 
                                    className="bg-emerald-600 rounded-xl py-4 flex-row justify-center items-center shadow-lg shadow-emerald-900/40 active:bg-emerald-700"
                                >
                                    <Text className="text-white font-bold text-lg tracking-wide">📸 Take a Picture</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    return null;
                })}

                {/* Network Loading Indicator */}
                {isLoading && (
                    <View className="self-start bg-[#1e293b] rounded-2xl rounded-bl-sm p-4 border border-slate-700 mb-4 shadow-md shadow-black/20">
                        <ActivityIndicator size="small" color="#3b82f6" />
                    </View>
                )}

            </ScrollView>

            {/* Input Interface */}
            <View className="absolute bottom-0 w-full flex-row items-center bg-[#0f172a] p-4 border-t border-slate-800">
                <TextInput
                    className="flex-1 bg-[#1e293b] text-white rounded-full px-5 py-3 border border-slate-700 text-base"
                    placeholder="Type your issue or query..."
                    placeholderTextColor="#64748b"
                    value={inputText}
                    onChangeText={setInputText}
                    editable={!requiresPhoto} 
                />
                <TouchableOpacity 
                    onPress={handleSend} 
                    disabled={!inputText.trim() || requiresPhoto} 
                    className={`ml-3 px-5 py-3 rounded-full justify-center items-center ${
                        !inputText.trim() || requiresPhoto ? 'bg-slate-800' : 'bg-blue-600 shadow-lg shadow-blue-500/30'
                    }`}
                >
                    <Text className={`font-bold ${!inputText.trim() || requiresPhoto ? 'text-slate-500' : 'text-white'}`}>
                        Send
                    </Text>
                </TouchableOpacity>
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}