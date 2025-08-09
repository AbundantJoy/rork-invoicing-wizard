import { useRouter } from "expo-router";
import { Plus, Search, UserPlus } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import AdBanner from "@/components/AdBanner";
import ClientCard from "@/components/ClientCard";
import EmptyState from "@/components/EmptyState";
import NativeAd from "@/components/NativeAd";
import { AD_CONFIG } from "@/constants/ads";
import { colors } from "@/constants/colors";
import { useInvoiceStore } from "@/hooks/useInvoiceStore";

export default function ClientsScreen() {
  const router = useRouter();
  const { clients } = useInvoiceStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddClient = () => {
    router.push("/client/create");
  };

  const renderEmptyState = () => (
    <>
      <EmptyState
        title="No Clients Yet"
        message="Add your first client to get started."
        onAddPress={handleAddClient}
        icon={<UserPlus size={48} color={colors.primaryLight} />}
      />
      {AD_CONFIG.SHOW_ADS_ON_CLIENT_LIST && <AdBanner size="medium" />}
    </>
  );

  const renderClientItem = ({ item, index }: { item: any; index: number }) => {
    const shouldShowNativeAd = AD_CONFIG.SHOW_NATIVE_ADS && 
      index > 0 && 
      index % AD_CONFIG.NATIVE_AD_FREQUENCY === 0;
    
    return (
      <>
        <ClientCard client={item} />
        {shouldShowNativeAd && <NativeAd />}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      {AD_CONFIG.SHOW_ADS_ON_CLIENT_LIST && <AdBanner style={{ marginHorizontal: 16 }} />}

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddClient}
        testID="add-client-button"
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
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