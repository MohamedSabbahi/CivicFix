import React, { useState, useRef } from 'react';
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
            text: `Hi ${firstName}! I'm the CivicFix AI assistant. How can I help you today?`,
            sender: 'bot',
            type: 'text'
        },
        {
            id: '2',
            sender: 'bot',
            type: 'quick_reply',
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [requiresPhoto, setRequiresPhoto] = useState(false);
    const [pendingReportData, setPendingReportData] = useState(null);
    const scrollRef = useRef(null);

    // ── Route A: direct analytics bypass (no Groq) ───────────────────────────
    const handleAnalyticsSummary = async () => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(), sender: 'user', type: 'text', text: '📊 View Analytics Summary'
        }]);
        setIsLoading(true);
        try {
            const { data } = await api.get('/chatbot/analytics');
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(), sender: 'bot', type: 'analytics_summary', payload: data
            }]);
        } catch (error) {
            console.error('Analytics Summary Error:', error?.response?.data || error?.message || error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(), sender: 'bot', type: 'text',
                text: 'Failed to load analytics. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Route B: engage reporting flow ───────────────────────────────────────
    const handleReportMode = () => {
        setMessages(prev => [...prev,
            { id: Date.now().toString(), sender: 'user', type: 'text', text: '📝 Report a Municipal Issue' },
            {
                id: (Date.now() + 1).toString(), sender: 'bot', type: 'text',
                text: "Sure! Describe the issue in your own words and I'll identify the category, generate a title, and guide you through reporting it."
            },
        ]);
    };

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
                const response = await api.get('/chatbot/department-stats');
                const deptData = response.data;

                let statText = "📊 **Department Performance:**\n\n";
                deptData.forEach(dept => {
                    statText += `🏢 ${dept.department}\n`;
                    statText += `✅ Resolved: ${dept.resolvedCivicIssuesCount}\n`;
                    statText += `⏱️ Avg Time: ${dept.averageResolutionTime}\n\n`;
                });

                setMessages((prev) => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    type: 'text',
                    text: statText.trim()
                }]);

            } else if (statType === 'resolution') {
                const response = await api.get('/chatbot/stats'); 
                const overviewData = response.data.data;

                let statText = "📈 **Global Resolution Rates:**\n\n";
                statText += `📋 Total Reports: ${overviewData.totalCivicIssues}\n`;
                statText += `✅ Resolved: ${overviewData.resolvedCivicIssues} (${overviewData.resolutionRate})\n`;
                statText += `⏳ In Progress: ${overviewData.inProgressCivicIssues}\n`;
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
            >

            {/* Header */}
            <View className="items-center justify-center py-4 border-b border-slate-800">
                <Text className="text-white text-lg font-bold tracking-wide">CivicFix Assistant</Text>
            </View>

            <ScrollView
                ref={scrollRef}
                className="flex-1 p-4"
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 10 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="handled"
            >
                
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

                    if (msg.type === 'quick_reply') {
                        return (
                            <View key={msg.id} className="bg-[#1e293b] border border-slate-700 p-4 rounded-xl self-start mb-4 shadow-md shadow-black/20 w-full">
                                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Quick options</Text>
                                <TouchableOpacity
                                    onPress={handleAnalyticsSummary}
                                    className="bg-blue-600 p-3 rounded-lg mb-2 flex-row items-center"
                                >
                                    <Text className="text-white font-medium">📊  View Analytics Summary</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleReportMode}
                                    className="bg-slate-700 p-3 rounded-lg flex-row items-center"
                                >
                                    <Text className="text-white font-medium">📝  Report a Municipal Issue</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    if (msg.type === 'analytics_summary') {
                        const { overview, departments } = msg.payload;
                        return (
                            <View key={msg.id} className="bg-[#1e293b] border border-slate-700 p-4 rounded-xl self-start mb-4 shadow-md shadow-black/20 w-full">
                                <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Municipal Analytics</Text>
                                <View className="flex-row flex-wrap gap-2 mb-3">
                                    <View className="bg-slate-800 rounded-lg p-3 flex-1 items-center">
                                        <Text className="text-white text-xl font-bold">{overview.total}</Text>
                                        <Text className="text-slate-400 text-xs mt-1">Total Issues</Text>
                                    </View>
                                    <View className="bg-emerald-950 border border-emerald-800 rounded-lg p-3 flex-1 items-center">
                                        <Text className="text-emerald-400 text-xl font-bold">{overview.resolutionRate}</Text>
                                        <Text className="text-slate-400 text-xs mt-1">Resolution Rate</Text>
                                    </View>
                                </View>
                                <View className="flex-row gap-2 mb-3">
                                    <View className="bg-slate-800 rounded-lg p-3 flex-1">
                                        <Text className="text-emerald-400 font-semibold">{overview.resolved} resolved</Text>
                                    </View>
                                    <View className="bg-slate-800 rounded-lg p-3 flex-1">
                                        <Text className="text-amber-400 font-semibold">{overview.inProgress} in progress</Text>
                                    </View>
                                </View>
                                <Text className="text-slate-500 text-xs mb-3">
                                    <Text className="text-blue-400">{overview.todayCount}</Text> new report{overview.todayCount !== 1 ? 's' : ''} today
                                </Text>
                                {departments?.length > 0 && (
                                    <>
                                        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">By Department</Text>
                                        {departments.map((d, i) => (
                                            <View key={i} className="flex-row justify-between py-1.5 border-b border-slate-700/50">
                                                <Text className="text-slate-300 text-sm flex-1 mr-2" numberOfLines={1}>{d.name}</Text>
                                                <Text className="text-emerald-400 text-xs">{d.resolved} ✓</Text>
                                                <Text className="text-slate-500 text-xs ml-3">{d.avgTime}</Text>
                                            </View>
                                        ))}
                                    </>
                                )}
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
            <View className="flex-row items-center bg-[#0f172a] p-4 border-t border-slate-800">
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