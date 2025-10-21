// Import  components from React Native and Expo
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useRef } from 'react';
import { Audio } from 'expo-av';


export default function App() {
  // useState hook to store the backend message received from FastAPI
  const [apiMessage, setApiMessage] = useState('');
  // State management
  // Holding the recording object
  const [recording, setRecording] = useState(null);
  // Tracks if recording is active
  const [isRecording, setIsRecording] = useState(false);
  // Stores the file path of the audio file - Uniform Resource Identifier
  const [recordingUri, setRecordingUri] = useState(null);
  // Store recording duration in seconds
  const [recordingDuration, setRecordingDuration] = useState(0);
  // Timer for recording duration
  const durationInterval = useRef(null); 


  // Request microphone permissions
  const getPermissions = async () => {
  try {
    // Uses Expo's audio module to trigger the system prompt
    const { status } = await Audio.requestPermissionsAsync();
    // Check if the permission was denied - return message ok/not ok depending on user choice
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant microphone permission to record bird songs.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
    // Catch any errors that occur during the permission request and alert the user
  } catch (error) {
    console.error('Failed to get permissions:', error);
    Alert.alert('Error', 'Could not get microphone permissions');
    return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Check permissions first, if not granted, exit function
      const hasPermission = await getPermissions();
      if (!hasPermission) return;

      // Reset previous states for a new recording session
      setRecordingDuration(0);

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        // Allows recording on iOS and iOS silent mode
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording...');

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
      Alert.alert('Error', 'Could not start recording. Please try again.');
      setIsRecording(false);
    }
  };

    // For testing
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Test Start Recording</Text>
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startRecording}>
            <Text style={styles.buttonText}>Start Recording</Text>
          </TouchableOpacity> 
        {isRecording && (
          <Text style={styles.durationText}>
            Recording... {recordingDuration}s
          </Text>
        )}
      </View>
    );
  
}






const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  apiMessage: {
    marginTop: 20,
    fontSize: 14,
    color: 'green',
  },
});
