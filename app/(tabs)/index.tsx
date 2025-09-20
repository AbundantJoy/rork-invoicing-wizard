import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

import EmptyState from "@/components/EmptyState";
import InvoiceCard from "@/components/InvoiceCard";
import StatusTabs from "@/components/StatusTabs";
import YearSummary from "@/components/YearSummary";

import { colors } from "@/constants/colors";
import { useFilteredInvoices, useInvoiceCounts, useYearlySummary } from "@/hooks/useInvoiceStore";
import { InvoiceStatus } from "@/types/invoice";
import { getCurrentYear } from "@/utils/formatters";

export default function InvoicesScreen() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<InvoiceStatus>("all");
  const currentYear = getCurrentYear();
  
  const invoices = useFilteredInvoices(activeStatus);
  const counts = useInvoiceCounts();
  const yearSummary = useYearlySummary(currentYear);

  const handleCreateInvoice = () => {
    router.push("/invoice/create");
  };

  const renderEmptyState = () => (
    <EmptyState
      title="No Invoices Yet"
      message="Create your first invoice to get started."
      onAddPress={handleCreateInvoice}
    />
  );

  const renderInvoiceItem = ({ item }: { item: any }) => {
    return <InvoiceCard invoice={item} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoiceItem}
        ListFooterComponent={null}
        ListHeaderComponent={
          <>
            <YearSummary
              totalAmount={yearSummary.totalAmount}
              paidAmount={yearSummary.paidAmount}
              unpaidAmount={yearSummary.unpaidAmount}
              year={currentYear}
            />
            <StatusTabs
              activeStatus={activeStatus}
              onStatusChange={setActiveStatus}
              counts={counts}
            />
          </>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateInvoice}
        testID="create-invoice-button"
      >
        <Plus size={24} color={colors.card} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});