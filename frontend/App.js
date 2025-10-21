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

  // Stop recording
  const stopRecording = async () => {
    try {
      console.log('Stopping recording...');

      // Ensure there is an active recording to stop, exit otherwise
      if (!recording) {
        Alert.alert('Error', 'No active recording found');
        return;
      }

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
      console.log('Recording stopped. File location:', uri);

      // Reset the recording object and update recording state
      setRecordingUri(uri);
      setRecording(null);
      setIsRecording(false);

       // Notify the user that recording is complete and ready to upload
      Alert.alert(
        'Recording Complete!',
        `Duration: ${recordingDuration} seconds\n\nReady to upload to backend.`,
        [{ text: 'OK' }]
      );
    // Catch any errors that occur during the recording stop process
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Could not stop recording properly.');
      setIsRecording(false);
    }
  };

    // For testing
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Test Start Recording</Text>
        {!isRecording ? (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startRecording}>
            <Text style={styles.buttonText}>Start Recording</Text>
          </TouchableOpacity> 
        ) : (
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopRecording}>
            <Text style={styles.buttonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}

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
