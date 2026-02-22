import React, {useContext, useEffect} from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { AuthContext } from '../context/AuthContext';


import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation(){
    const  { userToken, isSplashLoading , logout} = useContext(AuthContext);
    const { setColorScheme } = useColorScheme();

    useEffect(() => {
        setColorScheme('dark');
    }, []);

    if (isSplashLoading) {
        return null;
    }
    
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userToken !== null ? (
                    <Stack.Screen name="Feed">
                 {() => (
                   <View className="flex-1 items-center justify-center bg-background-dark">
                     <Text className="text-white text-2xl font-bold mb-8">
                        Welcome to CivicFix!
                     </Text>
                     
                     {/* 2. Add the Logout Button */}
                     <TouchableOpacity 
                        className="bg-red-600 px-6 py-3 rounded-lg active:bg-red-700"
                        onPress={() => logout()}
                     >
                        <Text className="text-white font-bold text-lg text-center">
                            Logout
                        </Text>
                     </TouchableOpacity>
                   </View>
                 )} 
             </Stack.Screen>
            ) : (
                <Stack.Group>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                </Stack.Group>
            )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}