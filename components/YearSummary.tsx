import { DollarSign } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { formatCurrency } from "@/utils/formatters";

interface YearSummaryProps {
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  year: number;
}

export default function YearSummary({
  totalAmount,
  paidAmount,
  unpaidAmount,
  year,
}: YearSummaryProps) {
  return (
    <View style={styles.container} testID="year-summary">
      <View style={styles.header}>
        <Text style={styles.title}>{year} Summary</Text>
      </View>

      <View style={styles.totalContainer}>
        <DollarSign size={24} color={colors.primary} />
        <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Paid</Text>
          <Text style={[styles.detailValue, { color: colors.success }]}>
            {formatCurrency(paidAmount)}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Unpaid</Text>
          <Text style={[styles.detailValue, { color: colors.danger }]}>
            {formatCurrency(unpaidAmount)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginLeft: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
});