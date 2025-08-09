import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface AppLogoProps {
  size?: number;
  onPress?: () => void;
}

export default function AppLogo({ size = 120, onPress }: AppLogoProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to home when logo is pressed
      router.push('/');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Image
        source={{ uri: 'https://r2-pub.rork.com/attachments/q542d9hqzvsi1l0x4l420' }}
        style={[styles.logo, { width: size, height: size * 0.6 }]} // Maintain aspect ratio
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Aspect ratio maintained by props
  },
});