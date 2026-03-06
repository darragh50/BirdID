import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function HomeTabScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bird Identifier</Text>
        <Text style={styles.headerSubtitle}>Tap to identify a bird by sound</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Big Green Microphone Button */}
        <TouchableOpacity
          style={styles.micButtonContainer}
          onPress={() => navigation.navigate('Recording')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.micButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="mic" size={80} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.tapText}>Tap to start listening</Text>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="headset-outline" size={32} color="#4CAF50" />
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Record 10-30 seconds of bird song and we'll identify it for you
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="earth-outline" size={32} color="#4CAF50" />
            <Text style={styles.infoTitle}>Best results</Text>
            <Text style={styles.infoText}>
              Record in a quiet location with clear bird sounds
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}