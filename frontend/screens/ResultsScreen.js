import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResultsScreen({ route, navigation }) {
  // Extract birdData and recordingData from route params
  const { birdData, recordingData } = route.params;
  // Added state for bird image, loading status, and audio playback
  const [birdImage, setBirdImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch bird image when component mounts if bird is detected, and clean up audio on unmount
  useEffect(() => {
    if (birdData && birdData.detected) {
      fetchBirdImage(birdData.common_name);
    } else {
      setLoadingImage(false);
    }
    // Cleanup function to unload sound when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Fetch bird image from Wikipedia
  const fetchBirdImage = async (birdName) => {
    console.log('fetchBirdImage called with:', birdName); 
    try {
      setLoadingImage(true);
      
      // Wikimedia requires a User-Agent header to stop standalone APKs getting blocked
      const headers = {
        'User-Agent': 'BirdIdentifierApp/1.0 (https://github.com/darraghr/birdidentifier; contact@example.com)',
        'Accept': 'application/json',
      };

      // Helper to safely fetch and parse JSON from Wikipedia
      const fetchWikiSummary = async (name) => {
        console.log('fetchWikiSummary called with:', name);
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
        const response = await fetch(url, { headers });
        console.log('response status:', response.status);
        if (!response.ok) return null;
        const text = await response.text();
        console.log('Wiki raw response:', text.substring(0, 150));
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      };

      // Try with common name first
      let data = await fetchWikiSummary(birdName);

      // If no image, try with scientific name
      if ((!data || !data.thumbnail) && birdData.all_detections && birdData.all_detections[0]) {
        const scientificName = birdData.all_detections[0].scientific_name;
        data = await fetchWikiSummary(scientificName);
      }

      // If we have a thumbnail, use it 
      if (data?.thumbnail?.source) {
        setBirdImage(data.thumbnail.source);
      } else {
        setBirdImage(null);
      }
      // Set loading to false after fetching
      setLoadingImage(false);
    } catch (error) {
      console.error('Error fetching bird image:', error);
      setBirdImage(null);
      setLoadingImage(false);
    }
  };

  // Function to play a recording when the user taps on it
  const playRecording = async () => {
    try {
      // Set audio mode to allow playback in silent mode and prevent recording conflicts
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      // Stop any currently playing sound to ensure only one plays at a time
      if (sound) {
        // Fully remove existing audio from memory
        await sound.unloadAsync();
        setSound(null);
      }
      // Load and play the audio from S3 URL
      const { sound: newSound } = await Audio.Sound.createAsync(
        // Remote audio URL
        { uri: recordingData.s3_url },
        // Auto play when loaded
        { shouldPlay: true }
      );
      // Store the new sound instance in state so it can be stopped later
      setSound(newSound);
      // Highlight the currently playing recording in the UI 
      setIsPlaying(true);

      // Set up listener for when sound finishes playing
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    // Catch any errors during playback
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Could not play recording');
    }
  };

  // Function to stop audio playback manually. For a stop button
  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  // Confidence color based on percentage
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return '#27ae60';
    if (confidence >= 0.4) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
          style={styles.backButton}
        >
          <Ionicons name="close" size={28} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {birdData?.detected ? 'Bird Identified' : 'No Bird Detected'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {birdData?.detected ? (
          <>
            {/* Bird Image */}
            <View style={styles.imageContainer}>
              {loadingImage ? (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                </View>
              ) : birdImage ? (
                <Image
                  source={{ uri: birdImage }}
                  style={styles.birdImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={80} color="#95a5a6" />
                  <Text style={styles.noImageText}>No image available</Text>
                </View>
              )}
            </View>

            {/* Bird Info */}
            <View style={styles.infoContainer}>
              {/* Common Name */}
              <Text style={styles.birdName}>{birdData.common_name}</Text>

              {/* Scientific Name */}
              {birdData.all_detections && birdData.all_detections[0] && (
                <Text style={styles.scientificName}>
                  {birdData.all_detections[0].scientific_name}
                </Text>
              )}

              {/* Confidence Score */}
              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceHeader}>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                  <Text
                    style={[
                      styles.confidenceValue,
                      { color: getConfidenceColor(birdData.confidence) },
                    ]}
                  >
                    {birdData.confidence_percent}%
                  </Text>
                </View>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${birdData.confidence_percent}%`,
                        backgroundColor: getConfidenceColor(birdData.confidence),
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Playback Controls */}
              <View style={styles.playbackContainer}>
                <Text style={styles.sectionTitle}>Your Recording</Text>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={isPlaying ? stopPlayback : playRecording}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isPlaying ? ['#e67e22', '#d35400'] : ['#3498db', '#2980b9']}
                    style={styles.playButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={32}
                      color="#fff"
                    />
                    <Text style={styles.playButtonText}>
                      {isPlaying ? 'Pause Recording' : 'Play Recording'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Other Possible Matches */}
              {birdData.all_detections && birdData.all_detections.length > 1 && (
                <View style={styles.alternativesContainer}>
                  <Text style={styles.sectionTitle}>Other Possible Matches</Text>
                  {birdData.all_detections.slice(1, 4).map((bird, index) => (
                    <View key={index} style={styles.alternativeItem}>
                      <View style={styles.alternativeInfo}>
                        <Text style={styles.alternativeName}>{bird.common_name}</Text>
                        <Text style={styles.alternativeScientific}>
                          {bird.scientific_name}
                        </Text>
                      </View>
                      <Text style={styles.alternativeConfidence}>
                        {Math.round(bird.confidence * 100)}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          /* No Bird Detected */
          <View style={styles.noBirdContainer}>
            <Ionicons name="close-circle-outline" size={100} color="#95a5a6" />
            <Text style={styles.noBirdTitle}>No Bird Detected</Text>
            <Text style={styles.noBirdText}>
              We couldn't identify a bird in this recording.{'\n\n'}
              This might be because:
            </Text>
            <View style={styles.reasonsList}>
              <Text style={styles.reasonItem}>• Background noise was too loud</Text>
              <Text style={styles.reasonItem}>• Recording was too short</Text>
              <Text style={styles.reasonItem}>• Bird song was unclear</Text>
              <Text style={styles.reasonItem}>
                • Species not in our database
              </Text>
            </View>
            <Text style={styles.tryAgainText}>Try recording again in a quieter location</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Recording')}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={24} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Record Another</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Main', { screen: 'MyBirds' })}            activeOpacity={0.8}
          >
            <Ionicons name="list" size={24} color="#3498db" />
            <Text style={styles.actionButtonText}>View My Birds</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
      borderBottomWidth: 1,
      borderBottomColor: '#e9ecef',
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      width: '100%',
      height: 300,
      backgroundColor: '#f8f9fa',
      overflow: 'hidden',
    },
    birdImage: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      width: '100%',
      height: '300',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
    },
    noImageText: {
      marginTop: 12,
      fontSize: 14,
      color: '#95a5a6',
    },
    infoContainer: {
      padding: 20,
    },
    birdName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 8,
    },
    scientificName: {
      fontSize: 18,
      fontStyle: 'italic',
      color: '#7f8c8d',
      marginBottom: 24,
    },
    confidenceContainer: {
      marginBottom: 32,
    },
    confidenceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    confidenceLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2c3e50',
    },
    confidenceValue: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    confidenceBar: {
      height: 8,
      backgroundColor: '#e9ecef',
      borderRadius: 4,
      overflow: 'hidden',
    },
    confidenceFill: {
      height: '100%',
      borderRadius: 4,
    },
    playbackContainer: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: 16,
    },
    playButton: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    playButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      gap: 12,
    },
    playButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
    },
    alternativesContainer: {
      marginBottom: 32,
    },
    alternativeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      marginBottom: 8,
    },
    alternativeInfo: {
      flex: 1,
    },
    alternativeName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: 2,
    },
    alternativeScientific: {
      fontSize: 14,
      fontStyle: 'italic',
      color: '#7f8c8d',
    },
    alternativeConfidence: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#7f8c8d',
    },
    noBirdContainer: {
      padding: 40,
      alignItems: 'center',
    },
    noBirdTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginTop: 24,
      marginBottom: 16,
    },
    noBirdText: {
      fontSize: 16,
      color: '#7f8c8d',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 16,
    },
    reasonsList: {
      alignSelf: 'stretch',
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    reasonItem: {
      fontSize: 14,
      color: '#7f8c8d',
      marginBottom: 8,
      lineHeight: 20,
    },
    tryAgainText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4CAF50',
      textAlign: 'center',
    },
    actionsContainer: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      paddingBottom: 40,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: '#f8f9fa',
      borderRadius: 12,
      gap: 8,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2c3e50',
    },
  });