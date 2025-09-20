import { Download } from "lucide-react-native";
import React, { useState } from "react";
import { 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from "react-native";


import AppLogo from "@/components/AppLogo";

import { colors } from "@/constants/colors";

import { useInvoiceStore } from "@/hooks/useInvoiceStore";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { exportInvoicesToCSV, getExportSummary } from "@/utils/csvExport";
import { formatCurrency } from "@/utils/formatters";

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettingsStore();
  const { invoices } = useInvoiceStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [businessAddress, setBusinessAddress] = useState(settings.businessAddress);
  const [businessPhone, setBusinessPhone] = useState(settings.businessPhone);
  const [businessEmail, setBusinessEmail] = useState(settings.businessEmail);
  const [emailTemplate, setEmailTemplate] = useState(settings.emailTemplate);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings({
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        businessPhone: businessPhone.trim(),
        businessEmail: businessEmail.trim(),
        emailTemplate: emailTemplate.trim(),
      });
      
      Alert.alert("Success", "Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefault = () => {
    Alert.alert(
      "Reset to Default",
      "Are you sure you want to reset all settings to default values?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            setBusinessName("Your Business");
            setBusinessAddress("");
            setBusinessPhone("");
            setBusinessEmail("");
            setEmailTemplate(`Dear {clientName},

Please find attached Invoice #{invoiceNumber} for your review.

Invoice Details:
- Invoice Date: {invoiceDate}
- Due Date: {dueDate}
- Total Amount: {totalAmount}

Please let me know if you have any questions.

Thank you for your business!

Best regards,
{businessName}`);
          }
        }
      ]
    );
  };



  const handleExportCSV = async () => {
    if (invoices.length === 0) {
      Alert.alert(
        "No Invoices",
        "You don't have any invoices to export yet.",
        [{ text: "OK" }]
      );
      return;
    }

    const summary = getExportSummary(invoices);
    const message = `Export ${summary.totalInvoices} invoices to CSV?\n\nSummary:\n• Total Amount: ${formatCurrency(summary.totalAmount)}\n• Paid: ${formatCurrency(summary.paidAmount)}\n• Unpaid: ${formatCurrency(summary.unpaidAmount)}${summary.dateRange ? `\n• Date Range: ${summary.dateRange.start} - ${summary.dateRange.end}` : ''}`;

    Alert.alert(
      "Export Invoices",
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            setIsExporting(true);
            try {
              await exportInvoicesToCSV(invoices);
              Alert.alert(
                "Export Successful",
                `Successfully exported ${invoices.length} invoices to CSV.`,
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert(
                "Export Failed",
                error instanceof Error ? error.message : "Failed to export invoices. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setIsExporting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Logo</Text>
          <Text style={styles.sectionDescription}>
            Your app logo that appears throughout the application.
          </Text>
          
          <View style={styles.logoContainer}>
            <AppLogo size={150} onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Your Business Name"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Address</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={businessAddress}
              onChangeText={setBusinessAddress}
              placeholder="Street, City, State, ZIP"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Phone</Text>
            <TextInput
              style={styles.input}
              value={businessPhone}
              onChangeText={setBusinessPhone}
              placeholder="(123) 456-7890"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Email</Text>
            <TextInput
              style={styles.input}
              value={businessEmail}
              onChangeText={setBusinessEmail}
              placeholder="business@example.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Template</Text>
          <Text style={styles.sectionDescription}>
            Customize the email template sent with invoices. Use placeholders: {"{clientName}"}, {"{invoiceNumber}"}, {"{invoiceDate}"}, {"{dueDate}"}, {"{totalAmount}"}, {"{businessName}"}
          </Text>
          
          <View style={styles.formGroup}>
            <TextInput
              style={[styles.input, styles.templateInput]}
              value={emailTemplate}
              onChangeText={setEmailTemplate}
              placeholder="Enter your email template..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={10}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToDefault}
          >
            <Text style={styles.resetButtonText}>Reset to Default</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Export</Text>
          <Text style={styles.sectionDescription}>
            Export all your invoices to a CSV file for backup or analysis in spreadsheet applications.
          </Text>
          
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportCSV}
            disabled={isExporting}
          >
            <Download size={20} color={colors.primary} />
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : `Export ${invoices.length} Invoices to CSV`}
            </Text>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </KeyboardAvoidingView>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  templateInput: {
    minHeight: 200,
    textAlignVertical: "top",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  resetButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.card,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 32,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 12,
  },
});