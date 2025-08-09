import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Share, X } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Sharing from "expo-sharing";

import { colors } from "@/constants/colors";

export default function ReceiptViewScreen() {
  const { uri } = useLocalSearchParams<{ uri: string; name: string }>();
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === "web") {
        console.log("Sharing not available on web");
        return;
      }
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.log("Sharing not available on this device");
        return;
      }
      
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error sharing receipt:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri }}
        style={styles.image}
        contentFit="contain"
      />
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleClose}
        >
          <X size={24} color={colors.card} />
        </TouchableOpacity>
        
        {Platform.OS !== "web" && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleShare}
          >
            <Share size={24} color={colors.card} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});