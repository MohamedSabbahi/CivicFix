import React, {useContext, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { AuthContext } from '../context/AuthContext';


import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import MainFeedScreen from '../screens/feed/MainFeedScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation(){
    const  { userToken, isSplashLoading } = useContext(AuthContext);
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
                    <Stack.Screen name="feed" component={MainFeedScreen} />
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