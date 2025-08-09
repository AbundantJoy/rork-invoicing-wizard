import { Image } from "expo-image";
import { Trash2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/colors";
import { Receipt } from "@/types/invoice";
import { formatDate } from "@/utils/formatters";

interface ReceiptItemProps {
  receipt: Receipt;
  onRemove?: (id: string) => void;
  onPress?: (receipt: Receipt) => void;
}

export default function ReceiptItem({
  receipt,
  onRemove,
  onPress,
}: ReceiptItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(receipt)}
      testID={`receipt-${receipt.id}`}
    >
      <Image
        source={{ uri: receipt.uri }}
        style={styles.thumbnail}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {receipt.name}
        </Text>
        <Text style={styles.date}>{formatDate(receipt.date)}</Text>
      </View>
      {onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(receipt.id)}
          testID={`remove-receipt-${receipt.id}`}
        >
          <Trash2 size={18} color={colors.danger} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  removeButton: {
    padding: 8,
  },
});