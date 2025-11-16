import React, { useState } from 'react';
// React Native components for building the UI
import {View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
// Import the useAuth hook to access authentication functions
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  // Local state for email and password input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Loading state to show spinner during login process
  const [loading, setLoading] = useState(false);
  // Extract signIn function from AuthContext using  hook
  const { signIn } = useAuth();

  // Function to handle login logic
  const handleLogin = async () => {
    // Form validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Validate email format
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Start loading indicator
    setLoading(true);
    try {
      // Attempt to sign in with provided email and password using firebase
      await signIn(email, password);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error) {
      // Set error codes to display appropriate message
      let errorMessage = 'Failed to log in. Please try again.';

      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }

      // Show alert with error message
      Alert.alert('Login Failed', errorMessage);
    } finally {
      // Stop loading indicator
      setLoading(false);
    }
  };

  return (
    // Adjust layout when keyboard appears (especially on ios)
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView>
        <View>
          {/* App header */}
          <Text>Bird Identifier</Text>
          <Text>Sign in to your account</Text>

          {/* Email input */}
          <View>
            <Text>Email</Text>
            <TextInput
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          {/* Password input */}
          <View>
            <Text>Password</Text>
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
          </View>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              // Show spinner during login
              <ActivityIndicator />
            ) : (
              // Show button text when not loading
              <Text>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Signup screen. Not implemented yet*/}
          <View>
            <Text>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              disabled={loading}
            >
              <Text>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}