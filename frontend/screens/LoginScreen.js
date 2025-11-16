import React, { useState } from 'react';
// React Native components for building the UI
import {View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet} from 'react-native';
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
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* App header */}
          <Text style={styles.title}>Bird Identifier</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Email input */}
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
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              // Show spinner during login
              <ActivityIndicator  color="#fff" />
            ) : (
              // Show button text when not loading
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Signup screen. Not implemented yet*/}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              disabled={loading}
            >
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles for the LoginScreen component
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
      backgroundColor: '#27ae60',
      borderRadius: 10,
      padding: 16,
      alignItems: 'center',
      marginTop: 10,
      shadowColor: '#27ae60',
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
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    signupText: {
      color: '#7f8c8d',
      fontSize: 14,
    },
    signupLink: {
      color: '#3498db',
      fontSize: 14,
      fontWeight: '600',
    },
  });