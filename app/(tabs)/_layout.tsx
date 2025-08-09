import { Tabs } from "expo-router";
import { FileText, Users, Settings } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";

import { colors } from "@/constants/colors";
import AppLogo from "@/components/AppLogo";

export default function TabLayout() {
  const headerLeft = () => (
    <View style={styles.headerLeft}>
      <AppLogo size={80} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false,
        headerLeft,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Invoices",
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: 16,
  },
});