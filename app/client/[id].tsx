import { useLocalSearchParams, useRouter } from "expo-router";
import { Edit, Mail, Phone, Trash } from "lucide-react-native";
import React, { useMemo } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import InvoiceCard from "@/components/InvoiceCard";
import { colors } from "@/constants/colors";
import { useInvoiceStore } from "@/hooks/useInvoiceStore";

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { clients, invoices, deleteClient } = useInvoiceStore();

  const client = clients.find(c => c.id === id);
  const clientInvoices = useMemo(() => {
    return invoices.filter(invoice => invoice.client.id === id);
  }, [invoices, id]);

  if (!client) {
    return (
      <EmptyState
        title="Client Not Found"
        message="The client you're looking for doesn't exist."
        showAddButton={false}
      />
    );
  }

  const handleEdit = () => {
    router.push(`/client/edit/${id}`);
  };

  const handleDelete = () => {
    if (clientInvoices.length > 0) {
      Alert.alert(
        "Cannot Delete",
        "This client has existing invoices. Delete the invoices first."
      );
      return;
    }

    Alert.alert(
      "Delete Client",
      "Are you sure you want to delete this client? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClient(id);
              router.back();
            } catch {
              Alert.alert("Error", "Failed to delete client.");
            }
          }
        }
      ]
    );
  };

  const handleCreateInvoice = () => {
    router.push({
      pathname: "/invoice/create",
      params: { clientId: id }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.clientCard}>
        <Text style={styles.clientName}>{client.name}</Text>
        
        <View style={styles.contactInfo}>
          {client.email && (
            <View style={styles.contactRow}>
              <Mail size={18} color={colors.primary} />
              <Text style={styles.contactText}>{client.email}</Text>
            </View>
          )}
          
          {client.phone && (
            <View style={styles.contactRow}>
              <Phone size={18} color={colors.primary} />
              <Text style={styles.contactText}>{client.phone}</Text>
            </View>
          )}
        </View>
        
        {client.address && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>{client.address}</Text>
          </View>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Edit size={18} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash size={18} color={colors.danger} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.invoicesSection}>
        <View style={styles.invoicesHeader}>
          <Text style={styles.invoicesTitle}>Invoices</Text>
          <TouchableOpacity
            style={styles.newInvoiceButton}
            onPress={handleCreateInvoice}
          >
            <Text style={styles.newInvoiceButtonText}>New Invoice</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={clientInvoices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <InvoiceCard invoice={item} />}
          contentContainerStyle={styles.invoicesList}
          ListEmptyComponent={
            <View style={styles.emptyInvoices}>
              <Text style={styles.emptyInvoicesText}>No invoices for this client</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  clientCard: {
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
  clientName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  addressContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.danger,
    marginLeft: 8,
  },
  invoicesSection: {
    flex: 1,
  },
  invoicesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  invoicesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  newInvoiceButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  newInvoiceButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.card,
  },
  invoicesList: {
    paddingBottom: 20,
  },
  emptyInvoices: {
    padding: 24,
    alignItems: "center",
  },
  emptyInvoicesText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
  },
});