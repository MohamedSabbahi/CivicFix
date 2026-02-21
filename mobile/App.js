import "./global.css";
import React, { useContext, useEffect } from 'react';
import { View, Text } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind'; 
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Import Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen'; // 3. Uncommented this

const Stack = createNativeStackNavigator();

// This component decides which stack to show
const AppNav = () => {
  const { userToken, isLoading } = useContext(AuthContext);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    // 4. Force NativeWind into dark mode on boot
    setColorScheme('dark');
  }, []);

  if (isLoading) {
    // You can put a splash screen or an ActivityIndicator here later
    return null; 
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken !== null ? (
            // User is Logged In
             <Stack.Screen name="Home">
                 {/* Styled the placeholder so you can actually see it in dark mode! */}
                 {() => (
                   <View className="flex-1 items-center justify-center bg-background-dark">
                     <Text className="text-white text-xl">Home Screen Placeholder</Text>
                   </View>
                 )} 
             </Stack.Screen>
        ) : (
            // User is NOT Logged In
            <Stack.Group>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
            </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
        <AppNav />
    </AuthProvider>
  );
}