import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface NativeAdProps {
  style?: any;
}

export default function NativeAd({ style }: NativeAdProps) {
  const handleAdPress = () => {
    // Placeholder - replace with actual ad click handling
    console.log('Native ad clicked');
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#f093fb', '#f5576c']}
        style={styles.adContent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={handleAdPress} style={styles.touchable}>
          <View style={styles.adHeader}>
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>📱</Text>
            </View>
            <View style={styles.adInfo}>
              <Text style={styles.adTitle}>Sample App</Text>
              <Text style={styles.adDescription}>Boost your productivity</Text>
            </View>
            <View style={styles.adBadge}>
              <Text style={styles.badgeText}>Ad</Text>
            </View>
          </View>
          <Text style={styles.adBody}>
            Discover amazing features that will help you manage your business more efficiently.
          </Text>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>Install Now</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adContent: {
    padding: 16,
  },
  touchable: {
    width: '100%',
  },
  adHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  adInfo: {
    flex: 1,
  },
  adTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  adDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  adBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  adBody: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});