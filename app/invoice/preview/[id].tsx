import { useLocalSearchParams, useRouter } from "expo-router";
import { Download, Mail, Share } from "lucide-react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator, Text } from "react-native";
import { WebView } from "react-native-webview";

import EmptyState from "@/components/EmptyState";
import { colors } from "@/constants/colors";
import { useInvoiceStore } from "@/hooks/useInvoiceStore";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { generatePDFFile, createPDFFileName } from "@/utils/pdfUtils";
import { sendInvoiceEmailWithPDF } from "@/utils/email";

export default function InvoicePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { invoices } = useInvoiceStore();
  const { settings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(true);

  const invoice = invoices.find(inv => inv.id === id);

  const generatePreview = useCallback(async () => {
    if (!invoice) return;
    
    try {
      setIsGeneratingPreview(true);
      const content = await generateInvoicePDF(invoice, settings);
      setHtmlContent(content);
    } catch (error) {
      console.error('Error generating preview:', error);
      Alert.alert('Error', 'Failed to generate invoice preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [invoice, settings]);

  useEffect(() => {
    if (invoice) {
      generatePreview();
    }
  }, [invoice, generatePreview]);

  if (!invoice) {
    return (
      <EmptyState
        title="Invoice Not Found"
        message="The invoice you're looking for doesn't exist."
        showAddButton={false}
      />
    );
  }

  if (isGeneratingPreview) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generating preview...</Text>
      </View>
    );
  }

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      const success = await sendInvoiceEmailWithPDF(invoice, settings);
      if (success) {
        Alert.alert("Success", "Invoice email sent successfully!");
        router.back();
      } else {
        Alert.alert("Error", "Failed to send invoice email.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send invoice email.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (Platform.OS === "web") {
      // For web, we can open the HTML in a new window
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
    } else {
      Alert.alert("Share", "Sharing functionality is not available on mobile for HTML content.");
    }
  };

  const handleDownload = async () => {
    try {
      const pdfResult = await generatePDFFile(invoice, settings);
      
      if (pdfResult.success && pdfResult.uri) {
        if (Platform.OS === "web") {
          // For web, create a download link
          const link = document.createElement('a');
          link.href = pdfResult.uri;
          link.download = createPDFFileName(invoice);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          Alert.alert("Success", "Invoice PDF has been downloaded!");
        } else {
          Alert.alert("Info", "PDF download is only available on web platform.");
        }
      } else {
        Alert.alert("Error", pdfResult.error || "Failed to generate PDF");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download PDF");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <ScrollView style={styles.webContainer}>
          <WebView
            source={{ html: htmlContent }}
            style={styles.webView}
            scalesPageToFit={true}
            startInLoadingState={true}
          />
        </ScrollView>
      ) : (
        <WebView
          source={{ html: htmlContent }}
          style={styles.webView}
          scalesPageToFit={true}
          startInLoadingState={true}
        />
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.downloadButton]} 
          onPress={handleDownload}
        >
          <Download size={20} color={colors.card} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.emailButton]} 
          onPress={handleSendEmail}
          disabled={isLoading}
        >
          <Mail size={20} color={colors.card} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]} 
          onPress={handleShare}
        >
          <Share size={20} color={colors.card} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.card,
  },
  actionButtons: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "column",
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginBottom: 12,
  },
  downloadButton: {
    backgroundColor: colors.success,
  },
  emailButton: {
    backgroundColor: colors.primary,
  },
  shareButton: {
    backgroundColor: colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
});