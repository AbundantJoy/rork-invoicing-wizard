import * as ImagePicker from "expo-image-picker";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Calendar, Camera, ChevronDown, ChevronRight, Image as ImageIcon, Plus, User, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
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
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { Client, LineItem, Receipt } from "@/types/invoice";
import { formatDateForInput } from "@/utils/formatters";

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { clients, addInvoice, createLineItem, generateClientInvoiceNumber } = useInvoiceStore();
  const { shouldShowNotification, incrementNotificationCount } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const cameraRef = useRef<any>(null);
  
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 30);
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(formatDateForInput(today.toISOString()));
  const [dueDate_, setDueDate] = useState(formatDateForInput(dueDate.toISOString()));
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [hasPONumber, setHasPONumber] = useState(false);
  const [poNumber, setPONumber] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([createLineItem()]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [notes, setNotes] = useState("");

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

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientPicker(false);
    // Auto-generate invoice number for selected client
    const nextNumber = generateClientInvoiceNumber(client.id);
    setInvoiceNumber(nextNumber);
  };

  const handleCreateClient = () => {
    router.push("/client/create");
  };

  const validateForm = () => {
    if (!selectedClient) {
      Alert.alert("Error", "Please select a client.");
      return false;
    }

    if (!invoiceDate) {
      Alert.alert("Error", "Please enter an invoice date.");
      return false;
    }

    if (!dueDate_) {
      Alert.alert("Error", "Please enter a due date.");
      return false;
    }

    const hasEmptyLineItems = lineItems.some(item => !item.description.trim());
    if (hasEmptyLineItems) {
      Alert.alert("Error", "Please fill in all line item descriptions.");
      return false;
    }

    return true;
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
        const receipt: Receipt = {
          id: Date.now().toString(),
          uri: photo.uri,
          name: `Receipt ${new Date().toLocaleString()}`,
          type: "image/jpeg",
          date: now,
        };
        
        setReceipts([...receipts, receipt]);
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
        
        const receipt: Receipt = {
          id: Date.now().toString(),
          uri: asset.uri,
          name: asset.fileName || `Receipt ${new Date().toLocaleString()}`,
          type: asset.mimeType || "image/jpeg",
          date: now,
        };
        
        setReceipts([...receipts, receipt]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleRemoveReceipt = (receiptId: string) => {
    setReceipts(receipts.filter(receipt => receipt.id !== receiptId));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await addInvoice({
        client: selectedClient!,
        invoiceDate,
        dueDate: dueDate_,
        invoiceNumber: invoiceNumber.trim() || undefined,
        poNumber: hasPONumber && poNumber.trim() ? poNumber.trim() : undefined,
        lineItems,
        total,
        isPaid: false,
        receipts,
        notes,
      });
      
      // Show notification if user hasn't seen it 3 times yet
      if (shouldShowNotification()) {
        Alert.alert(
          "Invoice Created!", 
          "Your invoice has been created successfully. To send it to your client, tap the 'Email' button on the invoice details page. The PDF will be generated and you can choose your email app to send it.",
          [
            { 
              text: "Got it!", 
              onPress: async () => {
                await incrementNotificationCount();
                router.replace("/");
              }
            }
          ]
        );
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      Alert.alert("Error", "Failed to create invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <TouchableOpacity
            style={styles.clientSelector}
            onPress={() => setShowClientPicker(!showClientPicker)}
          >
            {selectedClient ? (
              <View style={styles.selectedClient}>
                <User size={18} color={colors.primary} />
                <Text style={styles.selectedClientName}>{selectedClient.name}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>Select a client</Text>
            )}
            <ChevronDown size={20} color={colors.textLight} />
          </TouchableOpacity>

          {showClientPicker && (
            <View style={styles.clientPickerContainer}>
              {clients.length === 0 ? (
                <View style={styles.noClientsContainer}>
                  <Text style={styles.noClientsText}>No clients found</Text>
                  <TouchableOpacity
                    style={styles.createClientButton}
                    onPress={handleCreateClient}
                  >
                    <Plus size={16} color={colors.primary} />
                    <Text style={styles.createClientText}>Create Client</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {clients.map(client => (
                    <TouchableOpacity
                      key={client.id}
                      style={styles.clientOption}
                      onPress={() => handleSelectClient(client)}
                    >
                      <Text style={styles.clientOptionName}>{client.name}</Text>
                      <Text style={styles.clientOptionEmail}>{client.email}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.createClientButton}
                    onPress={handleCreateClient}
                  >
                    <Plus size={16} color={colors.primary} />
                    <Text style={styles.createClientText}>Create New Client</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.dateLabel}>Invoice Number</Text>
            <TextInput
              style={styles.invoiceNumberInput}
              value={invoiceNumber}
              onChangeText={setInvoiceNumber}
              placeholder={selectedClient ? generateClientInvoiceNumber(selectedClient.id) : "0001"}
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                setHasPONumber(!hasPONumber);
                if (hasPONumber) {
                  setPONumber("");
                }
              }}
            >
              <View style={[styles.checkbox, hasPONumber && styles.checkboxChecked]}>
                {hasPONumber && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>Add PO Number</Text>
            </TouchableOpacity>
            
            {hasPONumber && (
              <TextInput
                style={styles.poNumberInput}
                value={poNumber}
                onChangeText={setPONumber}
                placeholder="Enter PO Number"
                placeholderTextColor={colors.textLight}
              />
            )}
          </View>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Invoice Date</Text>
              <View style={styles.dateInputContainer}>
                <Calendar size={18} color={colors.textLight} />
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
                <Calendar size={18} color={colors.textLight} />
                <TextInput
                  style={styles.dateInput}
                  value={dueDate_}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
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
              <Plus size={18} color={colors.primary} />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lineItemsContainer}>
            <View style={styles.lineItemHeader}>
              <Text style={[styles.lineItemHeaderText, { flex: 2 }]}>Description</Text>
              <Text style={[styles.lineItemHeaderText, { width: 60, textAlign: "center" }]}>Qty</Text>
              <Text style={[styles.lineItemHeaderText, { width: 60, textAlign: "center" }]}>Price</Text>
              <Text style={[styles.lineItemHeaderText, { width: 70, textAlign: "right", marginRight: 8 }]}>Amount</Text>
              <View style={{ width: 24 }} />
            </View>
            
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Receipts (Optional)</Text>
            <View style={styles.receiptActions}>
              <TouchableOpacity
                style={styles.receiptActionButton}
                onPress={handleTakePicture}
              >
                <Camera size={16} color={colors.primary} />
                <Text style={styles.receiptActionText}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.receiptActionButton}
                onPress={handlePickImage}
              >
                <ImageIcon size={16} color={colors.primary} />
                <Text style={styles.receiptActionText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.receiptsContainer}>
            {receipts.length === 0 ? (
              <Text style={styles.noReceiptsText}>
                No receipts added yet. Take a photo or upload an image.
              </Text>
            ) : (
              receipts.map(receipt => (
                <ReceiptItem
                  key={receipt.id}
                  receipt={receipt}
                  onRemove={handleRemoveReceipt}
                />
              ))
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>Create Invoice</Text>
          <ChevronRight size={20} color={colors.card} />
        </TouchableOpacity>
      </ScrollView>
      
      {isCameraActive && (
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
      )}
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
  clientSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedClient: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedClientName: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textLight,
  },
  clientPickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noClientsContainer: {
    alignItems: "center",
    padding: 16,
  },
  noClientsText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  clientOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clientOptionName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  clientOptionEmail: {
    fontSize: 14,
    color: colors.textLight,
  },
  createClientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 8,
  },
  createClientText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    flexDirection: "row",
    alignItems: "center",
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
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
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
    marginLeft: 4,
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
    justifyContent: "flex-end",
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
    marginRight: 16,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    width: 80,
    textAlign: "right",
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
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.card,
    marginRight: 8,
  },
  receiptActions: {
    flexDirection: "row",
  },
  receiptActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    marginLeft: 8,
  },
  receiptActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 4,
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
  cameraContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 1000,
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
  formGroup: {
    marginBottom: 16,
  },
  invoiceNumberInput: {
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.textLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.card,
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  poNumberInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginTop: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});