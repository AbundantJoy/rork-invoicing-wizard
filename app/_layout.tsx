import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, StyleSheet } from "react-native";

import SetupGuard from "@/components/AuthGuard";
import AppLogo from "@/components/AppLogo";
import { InvoiceStoreProvider } from "@/hooks/useInvoiceStore";
import { SettingsStoreProvider } from "@/hooks/useSettingsStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const headerLeft = () => (
    <View style={styles.headerLeft}>
      <AppLogo size={80} />
    </View>
  );

  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: "#ffffff",
      },
      headerShadowVisible: false,
      headerLeft,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="invoice/[id]" 
        options={{ 
          title: "Invoice Details",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="invoice/create" 
        options={{ 
          title: "Create Invoice",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="invoice/edit/[id]" 
        options={{ 
          title: "Edit Invoice",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="client/[id]" 
        options={{ 
          title: "Client Details",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="client/create" 
        options={{ 
          title: "Add Client",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="client/edit/[id]" 
        options={{ 
          title: "Edit Client",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="receipt/view" 
        options={{ 
          title: "Receipt",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="invoice/preview/[id]" 
        options={{ 
          title: "Invoice Preview",
          presentation: "modal",
          headerLeft: () => null,
        }} 
      />
      <Stack.Screen 
        name="setup" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SettingsStoreProvider>
          <SetupGuard>
            <InvoiceStoreProvider>
              <RootLayoutNav />
            </InvoiceStoreProvider>
          </SetupGuard>
        </SettingsStoreProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: 16,
  },
});