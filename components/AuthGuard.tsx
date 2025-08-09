import { useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { useAuthStore } from "@/hooks/useAuthStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { authState, isLoading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!authState.hasCredentials) {
      // No credentials exist, redirect to setup
      if (!inAuthGroup) {
        router.replace("/auth/setup");
      }
    } else if (!authState.isAuthenticated) {
      // Credentials exist but not authenticated, redirect to login
      if (!inAuthGroup) {
        router.replace("/auth/login");
      }
    } else {
      // Authenticated, redirect away from auth screens
      if (inAuthGroup) {
        router.replace("/");
      }
    }
  }, [authState, isLoading, segments, router]);

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