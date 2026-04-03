import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { sendChatMessage } from '../../services/api';

export default function ChatbotScreen({ navigation }) {
  // --- UI and Chat State ---
  const [messages, setMessages] = useState([
    { id: '1', text: "Hi Mohamed! I'm the CivicFix AI. What issue would you like to report today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- AI Workflow State ---
  const [requiresPhoto, setRequiresPhoto] = useState(false); 
  const [pendingReportData, setPendingReportData] = useState(null); 

  /**
   * Sends the user's input to the AI microservice and handles the intent-based response.
   */
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await sendChatMessage(userMsg.text);
      
      if (aiResponse.intent === 'REPORT_ISSUE') {
        setPendingReportData({ department: aiResponse.department, text: userMsg.text });
        
        const botMsg = { 
          id: (Date.now() + 1).toString(), 
          text: aiResponse.reply || "I can help with that. Please take a photo of the problem so I can capture your location and finalize the report!", 
          sender: 'bot' 
        };
        setMessages((prev) => [...prev, botMsg]);
        
        if (aiResponse.requires_photo) {
          setRequiresPhoto(true); 
        }
      } else {
        const botMsg = { 
            id: (Date.now() + 1).toString(), 
            text: aiResponse.reply || "I've checked the system. How else can I help?", 
            sender: 'bot' 
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      const errorMsg = { 
          id: (Date.now() + 1).toString(), 
          text: "Sorry, I am having trouble connecting to the network right now.", 
          sender: 'bot' 
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gathers hardware permissions, captures media/location, and navigates to the Report creation UI.
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
            prefilledCategory: pendingReportData.department,
            prefilledDescription: pendingReportData.text,
            prefilledTitle: `${pendingReportData.department} Issue`
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
        
        {/* Simple Header for visual consistency */}
        <View className="items-center justify-center py-4 border-b border-slate-800">
            <Text className="text-white text-lg font-bold tracking-wide">CivicFix Assistant</Text>
        </View>

        <ScrollView className="flex-1 p-4 mb-20" contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 10 }}>
            
            {/* Chat History */}
            {messages.map((msg) => (
            <View key={msg.id} className={`mb-4 max-w-[80%] rounded-2xl p-4 ${
                msg.sender === 'user' 
                ? 'bg-blue-600 self-end rounded-br-sm shadow-md shadow-blue-900/20' 
                : 'bg-[#1e293b] self-start rounded-bl-sm border border-slate-700 shadow-md shadow-black/20'
            }`}>
                <Text className={msg.sender === 'user' ? 'text-white' : 'text-slate-200 text-base leading-6'}>
                    {msg.text}
                </Text>
            </View>
            ))}

            {/* Loading State */}
            {isLoading && (
            <View className="self-start bg-[#1e293b] rounded-2xl rounded-bl-sm p-4 border border-slate-700 mb-4 shadow-md shadow-black/20">
                <ActivityIndicator size="small" color="#3b82f6" />
            </View>
            )}

            {/* Dynamic Action Button */}
            {requiresPhoto && (
            <View className="self-center my-4 w-full px-2">
                <TouchableOpacity 
                    onPress={handleTakePhoto} 
                    className="bg-emerald-600 rounded-xl py-4 flex-row justify-center items-center shadow-lg shadow-emerald-900/40 active:bg-emerald-700"
                >
                <Text className="text-white font-bold text-lg tracking-wide">📸 Take a Picture</Text>
                </TouchableOpacity>
            </View>
            )}
        </ScrollView>

        {/* Input Bar */}
        <View className="absolute bottom-0 w-full flex-row items-center bg-[#0f172a] p-4 border-t border-slate-800">
            <TextInput
                className="flex-1 bg-[#1e293b] text-white rounded-full px-5 py-3 border border-slate-700 text-base"
                placeholder="Type your issue..."
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