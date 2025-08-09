import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

import AdBanner from "@/components/AdBanner";
import EmptyState from "@/components/EmptyState";
import InvoiceCard from "@/components/InvoiceCard";
import NativeAd from "@/components/NativeAd";
import StatusTabs from "@/components/StatusTabs";
import YearSummary from "@/components/YearSummary";
import { AD_CONFIG } from "@/constants/ads";
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
    <>
      <EmptyState
        title="No Invoices Yet"
        message="Create your first invoice to get started."
        onAddPress={handleCreateInvoice}
      />
      {AD_CONFIG.SHOW_ADS_ON_HOME && <AdBanner size="medium" />}
    </>
  );

  const renderInvoiceItem = ({ item, index }: { item: any; index: number }) => {
    const shouldShowNativeAd = AD_CONFIG.SHOW_NATIVE_ADS && 
      index > 0 && 
      index % AD_CONFIG.NATIVE_AD_FREQUENCY === 0;
    
    return (
      <>
        <InvoiceCard invoice={item} />
        {shouldShowNativeAd && <NativeAd />}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoiceItem}
        ListFooterComponent={AD_CONFIG.SHOW_ADS_ON_HOME ? <AdBanner /> : null}
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