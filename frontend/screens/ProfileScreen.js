import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  // Auth context to get user info and logout function
  const { user, logout } = useAuth();

  // Handle logout with confirmation
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };
  // Profile options with icons, titles, subtitles, and onPress handlers
  const profileOptions = [
    {
      icon: 'person-outline',
      title: 'Account',
      subtitle: user?.email || 'Not logged in',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage your preferences',
      onPress: () => Alert.alert('Coming Soon', 'This feature is coming soon!'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact us',
      onPress: () => Alert.alert('Coming Soon', 'This feature is coming soon!'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'Version 1.0.0',
      onPress: () => Alert.alert(
        'Bird Identifier',
        'Version 1.0.0\n\nAI powered bird identification using BirdNET.\n\nDeveloped as a final year project.'
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.userName}>{user?.email || 'Guest User'}</Text>
          <Text style={styles.userStatus}>Active Account</Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon} size={24} color="#4CAF50" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#95a5a6" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          Made for bird lovers
        </Text>
      </ScrollView>
    </View>
  );
}