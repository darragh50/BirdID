import React from 'react';
// Navigation container for managing app navigation state
import { NavigationContainer } from '@react-navigation/native';
// Stack navigator for screen transitions
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Auth context provider and hook to manage user authentication state
import { AuthProvider, useAuth } from './contexts/AuthContext';
// React Native components for UI
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import app screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeTabScreen from './screens/HomeScreen';
import RecordingScreen from './screens/RecordingScreen';
import AnalysingScreen from './screens/AnalysingScreen';
import ResultsScreen from './screens/ResultsScreen';
import MyBirdsScreen from './screens/MyBirdsScreen';
import ProfileScreen from './screens/ProfileScreen';

// Create a stack navigator instance
const Stack = createNativeStackNavigator();
// Create a bottom tab navigator instance
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator (Main App)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          // Set icon based on route name and focus state
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyBirds') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          // Return the appropriate icon component
          return <Ionicons name={iconName} size={size} color={color} />;
        }, // Set active and inactive tint colors for tab icons
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="MyBirds"
        component={MyBirdsScreen}
        options={{ tabBarLabel: 'My Birds' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Navigation component that decides which screens to show based on auth state
function Navigation() {
  // Get current user and loading state from AuthContext
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    // Navigation container manages navigation tree and state
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated Stack
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Recording" component={RecordingScreen} />
            <Stack.Screen name="Analysing" component={AnalysingScreen} />
            <Stack.Screen name="Results" component={ResultsScreen} />
          </>
        ) : (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
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


