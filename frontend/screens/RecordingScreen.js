import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function RecordingScreen({ navigation }) {
  // Auth hook
  const { getIdToken } = useAuth();
  // State management
  // Holding the recording object
  const [recording, setRecording] = useState(null);
  // Tracks if recording is active
  const [isRecording, setIsRecording] = useState(false);
  // Store recording duration in seconds
  const [recordingDuration, setRecordingDuration] = useState(0);
  // Stores the file path of the audio file. Uniform Resource Identifier
  const [recordingUri, setRecordingUri] = useState(null);
  // Timer for recording duration
  const durationInterval = useRef(null);
  
  // Animated values for waveform
  const wave1 = useRef(new Animated.Value(0.3)).current;
  const wave2 = useRef(new Animated.Value(0.5)).current;
  const wave3 = useRef(new Animated.Value(0.7)).current;
  const wave4 = useRef(new Animated.Value(0.5)).current;
  const wave5 = useRef(new Animated.Value(0.3)).current;

  // Start recording automatically when screen loads
  useEffect(() => {
    startRecording();
    return () => {
      // Cleanup on unmount
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  // Animate waveform while recording
  useEffect(() => {
    if (isRecording) {
      // Create pulsing animation for each wave bar
      const animateWave = (wave, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(wave, {
              toValue: Math.random(),
              duration: 300 + delay,
              useNativeDriver: true,
            }),
            Animated.timing(wave, {
              toValue: Math.random(),
              duration: 300 + delay,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateWave(wave1, 0);
      animateWave(wave2, 50);
      animateWave(wave3, 100);
      animateWave(wave4, 50);
      animateWave(wave5, 0);
    }
  }, [isRecording]);

    // Request microphone permissions
  const getPermissions = async () => {
    try {
      // Uses Expo's audio module to trigger the system prompt
      const { status } = await Audio.requestPermissionsAsync();
      // Check if the permission was denied - return message ok/not ok depending on user choice
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to record bird songs.'
        );
        navigation.goBack();
        return false;
      }
      return true;
    // Catch any errors that occur during the permission request and alert the user
    } catch (error) {
      console.error('Failed to get permissions:', error);
      Alert.alert('Error', 'Could not get microphone permissions');
      navigation.goBack();
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Check permissions first, if not granted, exit function
      const hasPermission = await getPermissions();
      if (!hasPermission) return;

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        // Allows recording on iOS and iOS silent mode
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        // Use high quality preset for better audio fidelity (Expo Go standard)
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      // Store the recording object and update the state to indicate recording is in progress
      setRecording(recording);
      setIsRecording(true);

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      console.log('Recording started successfully');
    // Catch any errors that occur during the recording start process
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Could not start recording');
      navigation.goBack();
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      // Ensure there is an active recording to stop, exit otherwise
      if (!recording) return;

      // Clear duration timer
      if (durationInterval.current) {
        // Stop the interval and reset the ref
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
      // Stop and unload the recording
      // Finalize the recording and make it available on disk
      await recording.stopAndUnloadAsync();
      // Reset audio mode to disable recording capabilities
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // Force the disable for iOS
      });

      // Get the recording URI of the saved file and log it
      const uri = recording.getURI();
      // Reset the recording object and update recording state
      setRecordingUri(uri);
      setRecording(null);
      setIsRecording(false);

      console.log('Recording stopped:', uri);

      // Navigate to analyzing screen
      navigation.replace('Analyzing', {
        recordingUri: uri,
        duration: recordingDuration,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Could not stop recording');
    }
  };

  // Make UI look nicer, 65 goes to 1:05 
  const formatDuration = (seconds) => {
    // Calculate the number of full minutes with Math.floor
    const mins = Math.floor(seconds / 60);
    // Calculate the remaining seconds after removing full minutes
    const secs = seconds % 60;
    // Return the formatted string
    // .padStart ensures two digits for seconds
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (recording) {
              recording.stopAndUnloadAsync();
            }
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="close" size={28} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Listening</Text>
      </View>

      {/* Waveform Visualization */}
      <View style={styles.waveformContainer}>
        <Animated.View
          style={[
            styles.waveBar,
            {
              height: wave1.interpolate({
                inputRange: [0, 1],
                outputRange: ['20%', '80%'],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.waveBar,
            {
              height: wave2.interpolate({
                inputRange: [0, 1],
                outputRange: ['30%', '90%'],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.waveBar,
            {
              height: wave3.interpolate({
                inputRange: [0, 1],
                outputRange: ['40%', '100%'],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.waveBar,
            {
              height: wave4.interpolate({
                inputRange: [0, 1],
                outputRange: ['30%', '90%'],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.waveBar,
            {
              height: wave5.interpolate({
                inputRange: [0, 1],
                outputRange: ['20%', '80%'],
              }),
            },
          ]}
        />
      </View>

      {/* Duration */}
      <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>

      {/* Instructions */}
      <Text style={styles.instructionsText}>
        Recording bird sounds{'\n'}
        Keep your phone steady and quiet
      </Text>

      {/* Stop Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopRecording}
          activeOpacity={0.8}
        >
          <View style={styles.stopIcon} />
        </TouchableOpacity>
        <Text style={styles.stopText}>Tap to stop</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    waveformContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 40,
    },
    waveBar: {
      width: 8,
      backgroundColor: '#4CAF50',
      borderRadius: 4,
    },
    durationText: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#2c3e50',
      textAlign: 'center',
      marginBottom: 16,
      fontVariant: ['tabular-nums'],
    },
    instructionsText: {
      fontSize: 16,
      color: '#7f8c8d',
      textAlign: 'center',
      marginBottom: 60,
      paddingHorizontal: 40,
      lineHeight: 24,
    },
    bottomContainer: {
      alignItems: 'center',
      paddingBottom: 60,
    },
    stopButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#f8f9fa',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 3,
      borderColor: '#e74c3c',
    },
    stopIcon: {
      width: 32,
      height: 32,
      backgroundColor: '#e74c3c',
      borderRadius: 4,
    },
    stopText: {
      fontSize: 16,
      color: '#7f8c8d',
      fontWeight: '500',
    },
  });