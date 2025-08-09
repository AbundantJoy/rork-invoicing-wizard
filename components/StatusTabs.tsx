import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/colors";
import { InvoiceStatus } from "@/types/invoice";

interface StatusTabsProps {
  activeStatus: InvoiceStatus;
  onStatusChange: (status: InvoiceStatus) => void;
  counts: {
    all: number;
    paid: number;
    unpaid: number;
  };
}

export default function StatusTabs({
  activeStatus,
  onStatusChange,
  counts,
}: StatusTabsProps) {
  const tabs: { key: InvoiceStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "paid", label: "Paid" },
    { key: "unpaid", label: "Unpaid" },
  ];

  return (
    <View style={styles.container} testID="status-tabs">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeStatus === tab.key && styles.activeTab,
          ]}
          onPress={() => onStatusChange(tab.key)}
          testID={`tab-${tab.key}`}
        >
          <Text
            style={[
              styles.tabText,
              activeStatus === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
          <View
            style={[
              styles.badge,
              activeStatus === tab.key && styles.activeBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                activeStatus === tab.key && styles.activeBadgeText,
              ]}
            >
              {counts[tab.key]}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.card,
  },
  badge: {
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  activeBadge: {
    backgroundColor: colors.primaryDark,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textLight,
  },
  activeBadgeText: {
    color: colors.card,
  },
});