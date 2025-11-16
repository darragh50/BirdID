import React, { useState } from 'react';
// Core react UI components needed for the screen
import {View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet} from 'react-native';
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
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Screen header text */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Bird Identifier today</Text>
          
          {/* Email input section */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
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
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
          </View>

          {/* Confirm password input */}
          <View style={styles.inputContainer}>
            <Text  style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
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
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            // Disable button while request is processing
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Link to Login screen */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles for the SignupScreen components
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    formContainer: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      color: '#2c3e50',
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: '#7f8c8d',
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color: '#2c3e50',
    },
    input: {
      backgroundColor: '#f8f9fa',
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#e9ecef',
    },
    button: {
      backgroundColor: '#3498db',
      borderRadius: 10,
      padding: 16,
      alignItems: 'center',
      marginTop: 10,
      shadowColor: '#3498db',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    buttonDisabled: {
      backgroundColor: '#95a5a6',
      shadowOpacity: 0,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    loginText: {
      color: '#7f8c8d',
      fontSize: 14,
    },
    loginLink: {
      color: '#27ae60',
      fontSize: 14,
      fontWeight: '600',
    },
});