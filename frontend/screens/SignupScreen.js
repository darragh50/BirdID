import React, { useState } from 'react';
// Core react UI components needed for the screen
import {View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
// Import authentication functions from AuthContext
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
  // Local state for user input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Loading state to disable UI while creating accoun
  const [loading, setLoading] = useState(false);
  // Extract signUp function from AuthContext
  const { signUp } = useAuth();

  // Function to handle account creation logic
  const handleSignup = async () => {
    // Basic validation to ensure all fields are filled
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Email format check
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    // Password length check
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    // Ensure password and confirmation matc
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Start loading spinner
    setLoading(true);
    try {
      // Call Firebase signup through AuthContext
      await signUp(email, password);
      // Notify user of successful account creation
      Alert.alert(
        'Success!',
        'Account created successfully. You are now logged in.',
        [{ text: 'OK' }]
      );
      // Navigation will happen automatically via AuthContext
    } catch (error) {
      let errorMessage = 'Failed to create account. Please try again.';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      // Display error alert
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      // Stop loading spinner regardless of outcome
      setLoading(false);
    }
  };

  return (
    // Ensures the UI adjusts when keyboard opens (especially on ios)
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView>
        <View>
          {/* Screen header text */}
          <Text>Create Account</Text>
          <Text>Join Bird Identifier today</Text>
          
          {/* Email input section */}
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
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
          </View>

          {/* Confirm password input */}
          <View>
            <Text>Confirm Password</Text>
            <TextInput
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
          </View>

          {/* Signup button */}
          <TouchableOpacity
            onPress={handleSignup}
            // Disable button while request is processing
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Link to Login screen */}
          <View>
            <Text>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}