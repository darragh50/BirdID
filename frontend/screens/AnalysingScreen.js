import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Animated, Alert} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AnalyzingScreen({ route, navigation }) {
  // Stores the file path of the audio file - Uniform Resource Identifier
  const { recordingUri, duration } = route.params;
  // Auth hook
  const { getIdToken } = useAuth();
  // State to track progress of upload and analysis
  const [progress, setProgress] = useState(0);
  // Animated value for spinning icon
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    // Spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Upload and analyze
    uploadAndAnalyze();
  }, []);

  // Interpolate spin value to degrees for rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const uploadAndAnalyze = async () => {
    try {
      setProgress(0.3);
      // Get the ID token for authenticated requests
      const token = await getIdToken();
      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        navigation.navigate('HomeTab');
        return;
      }
      // Simulate progress for upload and analysis
      setProgress(0.5);

      // Create form data to hold the audio file and metadata
      const formData = new FormData();
      // Extract filename from URI
      const uriParts = recordingUri.split('/');
      // Get the last part as filename, -1 as array starts at 0
      const filename = uriParts[uriParts.length - 1];

      // Append the audio file tothe formData obj
      formData.append('audio', {
        // The URI, Expo's default recording format is m4a
        // and a fallback default name 
        uri: recordingUri,
        type: 'audio/m4a',
        name: filename || 'recording.m4a',
      });
      // Append the duration of the recording as a string
      formData.append('duration', duration.toString());
      
      // Define the backend URL, my IP for now
      const BACKEND_URL = 'http://192.168.1.16:8000';

      setProgress(0.7);

      // Send a POST request to the backend with the audio data
      const response = await fetch(`${BACKEND_URL}/upload-audio`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Include the ID token in the Authorization header
        },
      });

      // Check if the response is not ok (status code outside 200-299 range)
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Parse the backend response
      const result = await response.json();
      setProgress(1.0);

      console.log('Analysis complete:', result);

      // Navigate to results
      setTimeout(() => {
        navigation.replace('Results', {
          birdData: result.bird_identification,
          recordingData: result,
        });
      }, 500);

    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert(
        'Analysis Failed',
        'Could not analyze recording. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('HomeTab'),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Bird Icon */}
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="leaf-outline" size={80} color="#4CAF50" />
        </Animated.View>

        <Text style={styles.title}>Analyzing recording...</Text>
        <Text style={styles.subtitle}>
          Comparing with thousands of bird species
        </Text>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
      </View>
    </View>
  );
}