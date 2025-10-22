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
  // Checks if upload is in progress
  const [isUploading, setIsUploading] = useState(false);
  // Checks if upload was successful
  const [uploadSuccess, setUploadSuccess] = useState(false);
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

  // Upload audio to backend
  const uploadAudio = async () => {
    // Ensure there is a recording URI to upload, exit otherwise
    if (!recordingUri) {
      Alert.alert('Error', 'No recording to upload');
      return;
    }

    // Setting the state to indicate that the upload is in progress
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      console.log('Uploading audio to backend...');

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
      formData.append('duration', recordingDuration.toString());

      // Define the backend URL, my IP for now
      const BACKEND_URL = 'http://192.168.1.34:8000'; 
      
      console.log('Sending to:', `${BACKEND_URL}/upload-audio`);

      // Send a POST request to the backend with the audio data
      const response = await fetch(`${BACKEND_URL}/upload-audio`, {
        // Body contains all data
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Check if the response is not ok (status code outside 200-299 range)
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // Parse the backend response
      const result = await response.json();
      console.log('Upload successful:', result);

      // Update state to reflect successful upload
      setUploadSuccess(true);
      // Then show success alert to user with backend response data
      Alert.alert(
        'Upload Successful!',
        `File saved on backend:\n${result.filename}\nSize: ${result.size_mb} MB`,
        [{ text: 'Great!' }]
      );
    // Catch any errors that occur during the upload process
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert(
        'Upload Failed',
        'Could not upload audio to backend. Make sure the backend server is running.\n\nError: ' + error.message
      );
    } finally {
      // Revert uploading state regardless of success or failure
      setIsUploading(false);
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

  // Render the main application UI
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bird Identifier</Text>
      <Text style={styles.subtitle}>Record a bird song to identify it</Text>

      <View style={styles.recordingSection}>
        {/* Recording Status */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}

        {/* Duration Display */}
        {(isRecording || recordingUri) && (
          <Text style={styles.durationText}>
            Duration: {formatDuration(recordingDuration)}
          </Text>
        )}

        {/* Main Recording Button */}
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.recordButton, styles.startButton]}
            onPress={startRecording}
            disabled={isUploading}
          >
            <Text style={styles.recordButtonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.recordButton, styles.stopButton]}
            onPress={stopRecording}
          >
            <Text style={styles.recordButtonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}

        {/* Upload Button (shown after recording stops) */}
        {recordingUri && !isRecording && (
          <TouchableOpacity
            style={[
              styles.uploadButton,
              isUploading && styles.uploadButtonDisabled,
            ]}
            onPress={uploadAudio}
            disabled={isUploading}
          >
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Uploading...' : 'Upload to Backend'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Success Indicator */}
        {uploadSuccess && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Recording saved successfully</Text>
            <Text style={styles.successSubtext}>
              Backend has received and stored your audio file
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Click "Start Recording" button{'\n'}
            2. Hold phone near bird song (10-30 seconds){'\n'}
            3. Click "Stop Recording" when done{'\n'}
            4. Click "Upload to Backend" to save
          </Text>
        </View>

        {/* Debug Info */}
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>
            Status: {isRecording ? 'Recording' : recordingUri ? 'Ready to upload' : 'Idle'}
          </Text>
          {recordingUri && (
            <Text style={styles.debugText} numberOfLines={1}>
              File: {recordingUri.split('/').pop()}
            </Text>
          )}
        </View>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}


// Styling
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
  },
  recordingSection: {
    width: '100%',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e74c3c',
    marginRight: 10,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  durationText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    fontFamily: 'monospace',
  },
  recordButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginBottom: 20,
    minWidth: 250,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 250,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  successText: {
    color: '#155724',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  successSubtext: {
    color: '#155724',
    fontSize: 14,
  },
  instructionsBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  instructionsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  debugBox: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    width: '100%',
  },
  debugText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'monospace',
  },
});


