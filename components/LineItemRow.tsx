import { Minus } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/colors";
import { LineItem } from "@/types/invoice";
import { formatCurrency } from "@/utils/formatters";

interface LineItemRowProps {
  item: LineItem;
  onUpdate: (id: string, updates: Partial<LineItem>) => void;
  onRemove: (id: string) => void;
  editable?: boolean;
}

export default function LineItemRow({
  item,
  onUpdate,
  onRemove,
  editable = true,
}: LineItemRowProps) {
  const handleDescriptionChange = (text: string) => {
    onUpdate(item.id, { ...item, description: text });
  };

  const handleQuantityChange = (text: string) => {
    // Allow empty string, numbers, and decimal points
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      // Store the raw text to preserve decimal points during typing
      const quantity = text === '' || text === '.' ? 0 : parseFloat(text) || 0;
      const amount = quantity * item.unitPrice;
      onUpdate(item.id, { quantity, amount, quantityText: text });
    }
  };

  const handleUnitPriceChange = (text: string) => {
    // Allow empty string, numbers, and decimal points
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      // Store the raw text to preserve decimal points during typing
      const unitPrice = text === '' || text === '.' ? 0 : parseFloat(text) || 0;
      const amount = item.quantity * unitPrice;
      onUpdate(item.id, { unitPrice, amount, unitPriceText: text });
    }
  };

  if (!editable) {
    return (
      <View style={styles.container} testID={`line-item-${item.id}`}>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>{item.quantity}</Text>
          <Text style={styles.detailText}>{formatCurrency(item.unitPrice)}</Text>
          <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={`line-item-${item.id}`}>
      <View style={styles.descriptionContainer}>
        <TextInput
          style={styles.input}
          value={item.description}
          onChangeText={handleDescriptionChange}
          placeholder="Description"
          placeholderTextColor={colors.textLight}
        />
      </View>
      <View style={styles.detailsContainer}>
        <TextInput
          style={[styles.input, styles.numberInput]}
          value={item.quantityText !== undefined ? item.quantityText : (item.quantity === 0 ? '' : item.quantity.toString())}
          onChangeText={handleQuantityChange}
          keyboardType="decimal-pad"
          placeholder="Qty"
          placeholderTextColor={colors.textLight}
        />
        <TextInput
          style={[styles.input, styles.numberInput]}
          value={item.unitPriceText !== undefined ? item.unitPriceText : (item.unitPrice === 0 ? '' : item.unitPrice.toString())}
          onChangeText={handleUnitPriceChange}
          keyboardType="decimal-pad"
          placeholder="Price"
          placeholderTextColor={colors.textLight}
        />
        <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          style={styles.removeButton}
          testID={`remove-item-${item.id}`}
        >
          <Minus size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  descriptionContainer: {
    flex: 2,
    paddingRight: 8,
  },
  detailsContainer: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    fontSize: 14,
    color: colors.text,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  numberInput: {
    width: 60,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: colors.text,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    width: 60,
    textAlign: "center",
  },
  amount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    width: 70,
    textAlign: "right",
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
});