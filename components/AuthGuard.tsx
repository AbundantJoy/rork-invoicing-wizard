import { useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { useSettingsStore } from "@/hooks/useSettingsStore";

interface SetupGuardProps {
  children: React.ReactNode;
}

export default function SetupGuard({ children }: SetupGuardProps) {
  const { needsSetup, isLoading } = useSettingsStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inSetupGroup = segments[0] === "setup";

    if (needsSetup()) {
      // Setup needed, redirect to setup screen
      if (!inSetupGroup) {
        router.replace("/setup");
      }
    } else {
      // Setup complete, redirect away from setup screen
      if (inSetupGroup) {
        router.replace("/");
      }
    }
  }, [needsSetup, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});