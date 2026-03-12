import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export default function MyBirdsScreen({ navigation }) {
  // Auth context to get the ID token for authenticated requests
  const { getIdToken } = useAuth();
  // Holding the recording object
  const [recordings, setRecordings] = useState([]);
  // Loading state for initial fetch 
  const [loading, setLoading] = useState(true);
  // Refreshing state for pull-to-refresh functionality
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recordings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchRecordings();
    }, [])
  );

  // Function to fetch recordings
  const fetchRecordings = async (isRefreshing = false) => {
    // Set loading state based on whether this is an initial load or a refresh action
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Get the Firebase ID token for the currently logged in user
      const token = await getIdToken();
      // If no token exists, the user is not authenticated
      if (!token) {
        console.log('No token available');
        return;
      }

      const BACKEND_URL = 'http://192.168.1.16:8000'; // My ip for now
      // Make GET request to /recordings endpoint     
      const response = await fetch(`${BACKEND_URL}/recordings`, {
        method: 'GET',
        headers: {
          // Add Firebase token to Authorization header
          // Backend will verify this token to confirm the user
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      // Parse the JSON response
      const data = await response.json();
      // Update state with returned recordings array
      setRecordings(data.recordings || []);
    
    } catch (error) {
      console.error('Error fetching recordings:', error);
      Alert.alert('Error', 'Could not load recordings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to delete a recording
  const deleteRecording = async (recordingId) => {
    // Confirmation popup before deletion
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // If confirmed, proceed to delete
            try {
              // We need the Firebase ID token for authorization
              const token = await getIdToken();
              const BACKEND_URL = 'http://192.168.1.16:8000';
              
              // Make DELETE request to backend
              const response = await fetch(
                `${BACKEND_URL}/recordings/${recordingId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );
              // If response not ok, throw error
              if (!response.ok) {
                throw new Error('Failed to delete');
              }

              fetchRecordings();
            } catch (error) {
              console.error('Error deleting:', error);
              Alert.alert('Error', 'Could not delete recording');
            }
          },
        },
      ]
    );
  };

  // Helper function to format date strings into more user-friendly formats
  const formatDate = (dateString) => {
    // Calculate the difference between the recording date and now to show "Today", "Yesterday", or "X days ago"
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Return user-friendly date formats based on how old the recording is
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render function for each recording item in the FlatList
  const renderRecordingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recordingCard}
      onPress={() => {
        // Navigate to results screen with this recording's data
        navigation.navigate('Results', {
          birdData: {
            detected: !!item.identified_bird,
            common_name: item.identified_bird,
            confidence: item.confidence,
            confidence_percent: Math.round(item.confidence * 100),
            all_detections: item.identified_bird ? [{
              common_name: item.identified_bird,
              scientific_name: '',
              confidence: item.confidence,
            }] : [],
          },
          recordingData: {
            s3_url: item.s3_url,
            filename: item.filename,
            duration_seconds: item.duration_seconds,
            size_mb: item.size_mb,
            database_id: item.id,
          },
        });
      }}
      activeOpacity={0.7}
    >
      {/* Bird icon or image placeholder */}
      <View style={styles.recordingIcon}>
        {item.identified_bird ? (
          <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
        ) : (
          <Ionicons name="help-circle" size={24} color="#95a5a6" />
        )}
      </View>

      {/* Recording info */}
      <View style={styles.recordingInfo}>
        <Text style={styles.birdName}>
          {item.identified_bird || 'Unknown Bird'}
        </Text>
        <Text style={styles.recordingDate}>{formatDate(item.created_at)}</Text>
        {item.identified_bird && (
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {Math.round(item.confidence * 100)}% confident
            </Text>
          </View>
        )}
      </View>

      {/* Delete button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          deleteRecording(item.id);
        }}
      >
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="musical-notes-outline" size={80} color="#95a5a6" />
      <Text style={styles.emptyTitle}>No Recordings Yet</Text>
      <Text style={styles.emptyText}>
        Start identifying birds by tapping the microphone on the Home screen
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.emptyButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your birds.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Birds</Text>
        <Text style={styles.headerSubtitle}>
          {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
        </Text>
      </View>

      {/* Recordings List */}
      <FlatList
        data={recordings}
        renderItem={renderRecordingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRecordings(true)}
            tintColor="#4CAF50"
          />
        }
      />
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
      backgroundColor: '#f8f9fa',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: '#7f8c8d',
    },
    listContainer: {
      padding: 20,
      flexGrow: 1,
    },
    recordingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    recordingIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#f8f9fa',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    recordingInfo: {
      flex: 1,
    },
    birdName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: 4,
    },
    recordingDate: {
      fontSize: 14,
      color: '#7f8c8d',
      marginBottom: 4,
    },
    confidenceBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#d4edda',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    confidenceText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#155724',
    },
    deleteButton: {
      padding: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginTop: 24,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      color: '#7f8c8d',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    emptyButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 24,
    },
    emptyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#7f8c8d',
    },
  });