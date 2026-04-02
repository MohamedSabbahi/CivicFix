import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
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
  // Toggles the visibility of the camera button when the AI identifies a reportable issue
  const [requiresPhoto, setRequiresPhoto] = useState(false); 
  // Temporarily holds NLP data (intent, department, text) to pass to the CreateReportScreen
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
        // Cache the NLP data for the camera handoff
        setPendingReportData({ department: aiResponse.department, text: userMsg.text });
        
        const botMsg = { 
          id: (Date.now() + 1).toString(), 
          text: aiResponse.reply || "I can help with that. Please take a photo of the problem so I can capture your location and finalize the report!", 
          sender: 'bot' 
        };
        setMessages((prev) => [...prev, botMsg]);
        
        // Trigger UI prompt for user to open the camera
        if (aiResponse.requires_photo) {
          setRequiresPhoto(true); 
        }
      } else {
        // Handle non-reporting intents (e.g., GET_STATS or unrecognized inputs)
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
        // MODIFIED: Updated to the new Expo SDK standard array format since MediaTypeOptions is deprecated
        mediaTypes: ['images'], 
        quality: 0.7,
      });

      if (!result.canceled) {
        setRequiresPhoto(false);
        
        // Handoff to CreateReportScreen with hardware data and AI-prefilled content
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4 mb-20" contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
        
        {/* Chat History */}
        {messages.map((msg) => (
          <View key={msg.id} className={`mb-4 max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user' ? 'bg-blue-600 self-end' : 'bg-white self-start shadow-sm border border-gray-100'}`}>
            <Text className={msg.sender === 'user' ? 'text-white' : 'text-gray-800'}>{msg.text}</Text>
          </View>
        ))}

        {/* Loading State */}
        {isLoading && (
          <View className="self-start bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <ActivityIndicator size="small" color="#2563eb" />
          </View>
        )}

        {/* Dynamic Action Button */}
        {requiresPhoto && (
          <View className="self-center my-4 w-full px-4">
            <TouchableOpacity onPress={handleTakePhoto} className="bg-green-500 rounded-xl py-4 flex-row justify-center items-center shadow-md">
              <Text className="text-white font-bold text-lg">📸 Take a Picture</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View className="absolute bottom-0 w-full flex-row items-center bg-white p-4 border-t border-gray-200">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-800"
          placeholder="Type your issue..."
          value={inputText}
          onChangeText={setInputText}
          editable={!requiresPhoto} 
        />
        <TouchableOpacity onPress={handleSend} disabled={!inputText.trim() || requiresPhoto} className={`ml-3 p-3 rounded-full ${!inputText.trim() || requiresPhoto ? 'bg-gray-300' : 'bg-blue-600'}`}>
          <Text className="text-white font-bold">Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}