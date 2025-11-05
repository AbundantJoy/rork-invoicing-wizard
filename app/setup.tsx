import { Building2, Mail, MapPin, Phone } from "lucide-react-native";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppLogo from "@/components/AppLogo";
import { colors } from "@/constants/colors";
import { useSettingsStore } from "@/hooks/useSettingsStore";

export default function SetupScreen() {
  const { completeSetup } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");

  const handleCompleteSetup = async () => {
    if (!businessName.trim()) {
      Alert.alert("Required Field", "Please enter your business name.");
      return;
    }

    setIsLoading(true);
    try {
      await completeSetup({
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        businessPhone: businessPhone.trim(),
        businessEmail: businessEmail.trim(),
      });
    } catch (error) {
      console.error("Error completing setup:", error);
      Alert.alert("Error", "Failed to save your business details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipSetup = async () => {
    Alert.alert(
      "Skip Setup",
      "You can always add your business details later in Settings. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            setIsLoading(true);
            try {
              await completeSetup({
                businessName: "Your Business",
                businessAddress: "",
                businessPhone: "",
                businessEmail: "",
              });
            } catch (error) {
              console.error("Error skipping setup:", error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <AppLogo size={120} />
            <Text style={styles.title}>Welcome to Instant Invoice</Text>
            <Text style={styles.subtitle}>
              Let&apos;s set up your business details to get started with creating professional invoices.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Building2 size={20} color={colors.primary} />
                <Text style={styles.label}>Business Name *</Text>
              </View>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Enter your business name"
                placeholderTextColor={colors.textLight}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.label}>Business Address</Text>
              </View>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={businessAddress}
                onChangeText={setBusinessAddress}
                placeholder="Street, City, State, ZIP"
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Phone size={20} color={colors.primary} />
                <Text style={styles.label}>Business Phone</Text>
              </View>
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
              <View style={styles.labelContainer}>
                <Mail size={20} color={colors.primary} />
                <Text style={styles.label}>Business Email</Text>
              </View>
              <TextInput
                style={styles.input}
                value={businessEmail}
                onChangeText={setBusinessEmail}
                placeholder="business@example.com"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipSetup}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleCompleteSetup}
              disabled={isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? "Setting up..." : "Get Started"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            You can always update these details later in the Settings tab.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  actions: {
    gap: 16,
    marginBottom: 24,
  },
  skipButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.card,
  },
  note: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
});