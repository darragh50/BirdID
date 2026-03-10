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
    try {
      setLoadingImage(true);
      
      // Try with common name first
      let url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(birdName)}`;
      let response = await fetch(url);
      let data = await response.json();

      // If no image, try with scientific name
      if (!data.thumbnail && birdData.all_detections && birdData.all_detections[0]) {
        const scientificName = birdData.all_detections[0].scientific_name;
        url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName)}`;
        response = await fetch(url);
        data = await response.json();
      }
      // If we have a thumbnail, use it (try to get a higher resolution version)
      if (data.thumbnail && data.thumbnail.source) {
        // Get higher resolution image
        const imageUrl = data.thumbnail.source.replace(/\/\d+px-/, '/500px-');
        setBirdImage(imageUrl);
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
          onPress={() => navigation.navigate('HomeTab')}
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
            onPress={() => navigation.navigate('MyBirds')}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={24} color="#3498db" />
            <Text style={styles.actionButtonText}>View My Birds</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}