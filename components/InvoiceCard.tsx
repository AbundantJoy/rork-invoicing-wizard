import { useNavigation } from "expo-router";
import { Calendar, Clock, DollarSign, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/colors";
import { Invoice } from "@/types/invoice";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface InvoiceCardProps {
  invoice: Invoice;
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    // @ts-ignore - navigation typing issue with expo-router
    navigation.navigate("invoice/[id]", { id: invoice.id });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      testID={`invoice-card-${invoice.id}`}
    >
      <View style={styles.header}>
        <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: invoice.isPaid ? colors.success : colors.warning }
        ]}>
          <Text style={styles.statusText}>
            {invoice.isPaid ? "PAID" : "UNPAID"}
          </Text>
        </View>
      </View>

      <View style={styles.clientRow}>
        <User size={16} color={colors.secondary} />
        <Text style={styles.clientName} numberOfLines={1}>
          {invoice.client.name}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Calendar size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{formatDate(invoice.invoiceDate)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={16} color={invoice.isPaid ? colors.success : colors.danger} />
          <Text 
            style={[
              styles.detailText, 
              { color: invoice.isPaid ? colors.success : colors.danger }
            ]}
          >
            {invoice.isPaid ? "Paid" : formatDate(invoice.dueDate)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <DollarSign size={16} color={colors.primary} />
        <Text style={styles.total}>{formatCurrency(invoice.total)}</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.card,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  clientName: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  total: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginLeft: 4,
  },
});