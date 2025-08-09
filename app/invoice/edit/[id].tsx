import * as ImagePicker from "expo-image-picker";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, ChevronRight, Image as ImageIcon, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
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

import LineItemRow from "@/components/LineItemRow";
import ReceiptItem from "@/components/ReceiptItem";
import { colors } from "@/constants/colors";
import { useInvoiceStore } from "@/hooks/useInvoiceStore";
import { LineItem, Receipt } from "@/types/invoice";
import { formatDateForInput } from "@/utils/formatters";

type TabType = "details" | "receipts";

export default function EditInvoiceScreen() {
  const { id, tab: initialTab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const router = useRouter();
  const { invoices, updateInvoice, createLineItem, addReceiptToInvoice, removeReceiptFromInvoice } = useInvoiceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab === "receipts" ? "receipts" : "details");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const cameraRef = useRef<any>(null);
  
  const invoice = invoices.find(inv => inv.id === id);
  
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  
  useEffect(() => {
    if (invoice) {
      setInvoiceDate(formatDateForInput(invoice.invoiceDate));
      setDueDate(formatDateForInput(invoice.dueDate));
      setLineItems([...invoice.lineItems]);
      setNotes(invoice.notes || "");
      setIsPaid(invoice.isPaid);
    }
  }, [invoice]);
  
  if (!invoice) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invoice not found</Text>
      </View>
    );
  }

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, createLineItem()]);
  };

  const handleUpdateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(
      lineItems.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    } else {
      Alert.alert("Cannot Remove", "Invoice must have at least one line item.");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateInvoice(id, {
        invoiceDate,
        dueDate,
        lineItems,
        total,
        isPaid,
        notes,
      });
      
      router.back();
    } catch (error) {
      console.error("Error updating invoice:", error);
      Alert.alert("Error", "Failed to update invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePicture = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Camera permission is needed to take pictures.");
        return;
      }
    }
    
    setIsCameraActive(true);
  };

  const handleCameraCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setIsCameraActive(false);
        
        const now = new Date().toISOString();
        const receipt: Omit<Receipt, "id"> = {
          uri: photo.uri,
          name: `Receipt ${new Date().toLocaleString()}`,
          type: "image/jpeg",
          date: now,
        };
        
        await addReceiptToInvoice(id, receipt);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const now = new Date().toISOString();
        
        const receipt: Omit<Receipt, "id"> = {
          uri: asset.uri,
          name: asset.fileName || `Receipt ${new Date().toLocaleString()}`,
          type: asset.mimeType || "image/jpeg",
          date: now,
        };
        
        await addReceiptToInvoice(id, receipt);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleRemoveReceipt = async (receiptId: string) => {
    Alert.alert(
      "Remove Receipt",
      "Are you sure you want to remove this receipt?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            await removeReceiptFromInvoice(id, receiptId);
          }
        }
      ]
    );
  };

  if (isCameraActive) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setIsCameraActive(false)}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCameraCapture}
            />
            
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setCameraType(current => current === "back" ? "front" : "back")}
            >
              <Camera size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "details" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("details")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "details" && styles.activeTabText,
            ]}
          >
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "receipts" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("receipts")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "receipts" && styles.activeTabText,
            ]}
          >
            Receipts
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "details" ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.dateContainer}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Invoice Date</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    value={invoiceDate}
                    onChangeText={setInvoiceDate}
                    placeholder="YYYY-MM-DD"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
              
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Due Date</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    value={dueDate}
                    onChangeText={setDueDate}
                    placeholder="YYYY-MM-DD"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status</Text>
              <View style={styles.statusOptions}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    isPaid && styles.activeStatusOption,
                  ]}
                  onPress={() => setIsPaid(true)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      isPaid && styles.activeStatusOptionText,
                    ]}
                  >
                    Paid
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    !isPaid && styles.activeStatusOption,
                  ]}
                  onPress={() => setIsPaid(false)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      !isPaid && styles.activeStatusOptionText,
                    ]}
                  >
                    Unpaid
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={handleAddLineItem}
              >
                <Text style={styles.addItemText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.lineItemsContainer}>
              {lineItems.map(item => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateLineItem}
                  onRemove={handleRemoveLineItem}
                />
              ))}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes or payment instructions..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
            <ChevronRight size={20} color={colors.card} />
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.receiptsContainer}>
          <View style={styles.receiptActions}>
            <TouchableOpacity
              style={styles.receiptActionButton}
              onPress={handleTakePicture}
            >
              <Camera size={20} color={colors.primary} />
              <Text style={styles.receiptActionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.receiptActionButton}
              onPress={handlePickImage}
            >
              <ImageIcon size={20} color={colors.primary} />
              <Text style={styles.receiptActionText}>Upload</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.receiptsList}>
            {invoice.receipts.length === 0 ? (
              <View style={styles.emptyReceiptsContainer}>
                <Text style={styles.emptyReceiptsText}>
                  No receipts attached to this invoice
                </Text>
                <Text style={styles.emptyReceiptsSubtext}>
                  Take a photo or upload an image of your receipt
                </Text>
              </View>
            ) : (
              invoice.receipts.map(receipt => (
                <ReceiptItem
                  key={receipt.id}
                  receipt={receipt}
                  onRemove={handleRemoveReceipt}
                />
              ))
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
            <ChevronRight size={20} color={colors.card} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: "center",
    marginTop: 24,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  dateInputContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateInput: {
    fontSize: 16,
    color: colors.text,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: "hidden",
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeStatusOption: {
    backgroundColor: colors.primary,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  activeStatusOptionText: {
    color: colors.card,
  },
  addItemButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  lineItemsContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: "top",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.card,
    marginRight: 8,
  },
  receiptsContainer: {
    flex: 1,
    padding: 16,
  },
  receiptActions: {
    flexDirection: "row",
    marginBottom: 16,
  },
  receiptActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  receiptActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 8,
  },
  receiptsList: {
    flexGrow: 1,
  },
  emptyReceiptsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyReceiptsText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyReceiptsSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.5)",
  },
});