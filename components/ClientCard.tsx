import { useNavigation } from "expo-router";
import { Mail, Phone, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/colors";
import { Client } from "@/types/invoice";

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    // @ts-ignore - navigation typing issue with expo-router
    navigation.navigate("client/[id]", { id: client.id });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      testID={`client-card-${client.id}`}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User size={20} color={colors.card} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {client.name}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        {client.email && (
          <View style={styles.detailRow}>
            <Mail size={16} color={colors.secondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {client.email}
            </Text>
          </View>
        )}

        {client.phone && (
          <View style={styles.detailRow}>
            <Phone size={16} color={colors.secondary} />
            <Text style={styles.detailText}>{client.phone}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
    flex: 1,
  },
});