import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AdBannerProps {
  size?: 'banner' | 'large' | 'medium';
  style?: any;
}

export default function AdBanner({ size = 'banner', style }: AdBannerProps) {
  const handleAdPress = () => {
    // Placeholder - replace with actual ad click handling
    console.log('Ad clicked');
  };

  const getAdDimensions = () => {
    switch (size) {
      case 'large':
        return { width: '100%', height: 250 };
      case 'medium':
        return { width: '100%', height: 150 };
      default:
        return { width: '100%', height: 50 };
    }
  };

  return (
    <View style={[styles.container, getAdDimensions(), style]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.adContent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={handleAdPress} style={styles.touchable}>
          <Text style={styles.adText}>Advertisement</Text>
          <Text style={styles.adSubtext}>Tap to learn more</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  adContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  touchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  adText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  adSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});