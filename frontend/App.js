// Import  components from React Native and Expo
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { useState } from 'react';


export default function App() {
  // useState hook to store the backend message received from FastAPI
  const [apiMessage, setApiMessage] = useState('');

  // Async function to test connection to the backend API
  const testBackendConnection = async () => {
  try {
    // Using my local ip to connect via expo go app
    const response = await fetch('http://192.168.1.34:8000/');
    // Parse the JSON response from FastAPI
    const data = await response.json();
    // Save the message to state and show an alert
    setApiMessage(data.message);
    // Alerts....
    Alert.alert('Success!', data.message);
  } catch (error) {
    Alert.alert('Error', 'Could not connect to backend');
    console.error(error);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bird Identifier App</Text>
      <Text style={styles.subtitle}>Frontend is running</Text>
    
      <Button 
        title="Test Backend Connection" 
        onPress={testBackendConnection}
      />
    
    {/* Conditionally render the backend message if it exists */}
    {apiMessage ? (
        <Text style={styles.apiMessage}>{apiMessage}</Text>
      ) : null}
      
      <StatusBar style="auto" />
    
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
