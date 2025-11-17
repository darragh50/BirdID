import React from 'react';
// Navigation container for managing app navigation state
import { NavigationContainer } from '@react-navigation/native';
// Stack navigator for screen transitions
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Auth context provider and hook to manage user authentication state
import { AuthProvider, useAuth } from './contexts/AuthContext';
// React Native components for UI
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import app screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';

// Create a stack navigator instance
const Stack = createNativeStackNavigator();

// Navigation component that decides which screens to show based on auth state
function Navigation() {
  // Get current user and loading state from AuthContext
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    // Navigation container manages navigation tree and state
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#27ae60',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          // If user is logged in then show the home screen
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Bird Identifier',
              headerShown: false, // Hide header since we have user info in screen
            }}
          />
        ) : (
          // If user is not logged in then show login and signup screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: 'Sign In',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                title: 'Create Account',
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Root component that wraps navigation in AuthProvider
export default function App() {
  return (
    // Provides authentication context to all child components
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

// Styling for loading spinner container
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


