// App.js
import "./global.css"; // KEEP THIS (NativeWind)
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Import Screens
import LoginScreen from './src/screens/auth/LoginScreen';
// import RegisterScreen from './src/screens/auth/RegisterScreen'; (Create this similar to Login)
// import HomeScreen from './src/screens/feed/MainFeedScreen';

const Stack = createNativeStackNavigator();

// This component decides which stack to show
const AppNav = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    // You can put a splash screen here
    return null; 
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken !== null ? (
            // User is Logged In
             <Stack.Screen name="Home">
                 {() => <View><Text>Home Screen Placeholder</Text></View>} 
             </Stack.Screen>
        ) : (
            // User is NOT Logged In
            <Stack.Group>
                <Stack.Screen name="Login" component={LoginScreen} />
                {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
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