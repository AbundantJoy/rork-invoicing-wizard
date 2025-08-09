import { FileText, Plus } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/colors";

interface EmptyStateProps {
  title: string;
  message: string;
  showAddButton?: boolean;
  onAddPress?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  message,
  showAddButton = true,
  onAddPress,
  icon,
}: EmptyStateProps) {
  return (
    <View style={styles.container} testID="empty-state">
      <View style={styles.iconContainer}>
        {icon || <FileText size={48} color={colors.primaryLight} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {showAddButton && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onAddPress}
          testID="add-button"
        >
          <Plus size={20} color={colors.card} />
          <Text style={styles.buttonText}>Create New</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.card,
    fontWeight: "600",
    marginLeft: 8,
  },
});