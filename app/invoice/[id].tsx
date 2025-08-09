import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Camera, Edit, Eye, Mail, Trash, X } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import LineItemRow from "@/components/LineItemRow";
import ReceiptItem from "@/components/ReceiptItem";
import { colors } from "@/constants/colors";
import { useInvoiceStore } from "@/hooks/useInvoiceStore";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { Receipt } from "@/types/invoice";
import { sendInvoiceEmailWithPDF } from "@/utils/email";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { invoices, deleteInvoice, updateInvoice } = useInvoiceStore();
  const { settings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return (
      <EmptyState
        title="Invoice Not Found"
        message="The invoice you're looking for doesn't exist."
        showAddButton={false}
      />
    );
  }

  const handleEdit = () => {
    router.push(`/invoice/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Invoice",
      "Are you sure you want to delete this invoice? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await deleteInvoice(id);
            router.back();
          }
        }
      ]
    );
  };

  const handleTogglePaid = () => {
    updateInvoice(id, { isPaid: !invoice.isPaid });
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      const success = await sendInvoiceEmailWithPDF(invoice, settings);
      if (!success) {
        Alert.alert("Error", "Failed to generate or share invoice. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to prepare email. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewInvoice = () => {
    router.push(`/invoice/preview/${id}`);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    router.push({
      pathname: "/receipt/view",
      params: { uri: receipt.uri, name: receipt.name }
    });
  };

  const handleAddReceipt = () => {
    router.push({
      pathname: "/invoice/edit/[id]",
      params: { id, tab: "receipts" }
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: `Invoice #${invoice.invoiceNumber}`,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.invoiceNumberContainer}>
          <Text style={styles.invoiceNumberLabel}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.statusBadge,
            { backgroundColor: invoice.isPaid ? colors.success : colors.warning }
          ]}
          onPress={handleTogglePaid}
        >
          <Text style={styles.statusText}>
            {invoice.isPaid ? "PAID" : "UNPAID"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client</Text>
        <View style={styles.clientCard}>
          <Text style={styles.clientName}>{invoice.client.name}</Text>
          {invoice.client.email && (
            <Text style={styles.clientDetail}>{invoice.client.email}</Text>
          )}
          {invoice.client.phone && (
            <Text style={styles.clientDetail}>{invoice.client.phone}</Text>
          )}
          {invoice.client.address && (
            <Text style={styles.clientDetail}>{invoice.client.address}</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Invoice Date</Text>
            <Text style={styles.detailValue}>{formatDate(invoice.invoiceDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Line Items</Text>
        <View style={styles.lineItemsCard}>
          <View style={styles.lineItemHeader}>
            <Text style={[styles.lineItemHeaderText, { flex: 2 }]}>Description</Text>
            <Text style={[styles.lineItemHeaderText, { width: 70, textAlign: "center" }]}>Qty</Text>
            <Text style={[styles.lineItemHeaderText, { width: 70, textAlign: "center" }]}>Price</Text>
            <Text style={[styles.lineItemHeaderText, { width: 80, textAlign: "right" }]}>Amount</Text>
          </View>
          
          {invoice.lineItems.map(item => (
            <LineItemRow
              key={item.id}
              item={item}
              onUpdate={() => {}}
              onRemove={() => {}}
              editable={false}
            />
          ))}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Receipts</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddReceipt}
          >
            <Camera size={18} color={colors.primary} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.receiptsContainer}>
          {invoice.receipts.length === 0 ? (
            <Text style={styles.noReceiptsText}>No receipts attached</Text>
          ) : (
            invoice.receipts.map(receipt => (
              <ReceiptItem
                key={receipt.id}
                receipt={receipt}
                onPress={handleViewReceipt}
              />
            ))
          )}
        </View>
      </View>

      {invoice.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.previewButton]} 
          onPress={handlePreviewInvoice}
        >
          <Eye size={20} color={colors.card} />
          <Text style={styles.actionButtonText}>Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.emailButton]} 
          onPress={handleSendEmail}
          disabled={isLoading}
        >
          <Mail size={20} color={colors.card} />
          <Text style={styles.actionButtonText}>Email</Text>
        </TouchableOpacity>
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={[styles.iconButton, styles.editButton]} 
            onPress={handleEdit}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.iconButton, styles.deleteButton]} 
            onPress={handleDelete}
          >
            <Trash size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  invoiceNumberContainer: {
    flex: 1,
  },
  invoiceNumberLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.card,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  clientCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  clientDetail: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  lineItemsCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lineItemHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineItemHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textLight,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  receiptsContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noReceiptsText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 4,
  },
  notesCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  previewButton: {
    backgroundColor: colors.secondary,
    marginRight: 8,
  },
  emailButton: {
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  actionButtonText: {
    color: colors.card,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  editButton: {
    borderColor: colors.primary,
    marginRight: 8,
  },
  deleteButton: {
    borderColor: colors.danger,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
});