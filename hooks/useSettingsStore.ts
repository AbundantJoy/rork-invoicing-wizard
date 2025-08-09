import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

export interface BusinessSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  emailTemplate: string;
  logoUri?: string;
  notificationCount?: number;
}

const SETTINGS_STORAGE_KEY = 'business_settings';

const defaultSettings: BusinessSettings = {
  businessName: 'Your Business',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  logoUri: undefined,
  notificationCount: 0,
  emailTemplate: `Dear {clientName},

Please find attached Invoice #{invoiceNumber} for your review.

Invoice Details:
- Invoice Date: {invoiceDate}
- Due Date: {dueDate}
- Total Amount: {totalAmount}

Please let me know if you have any questions.

Thank you for your business!

Best regards,
{businessName}`,
};

export const [SettingsStoreProvider, useSettingsStore] = createContextHook(() => {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage
  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  // Format email template with invoice data
  const formatEmailTemplate = (invoiceData: {
    clientName: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: string;
  }) => {
    return settings.emailTemplate
      .replace(/{clientName}/g, invoiceData.clientName)
      .replace(/{invoiceNumber}/g, invoiceData.invoiceNumber)
      .replace(/{invoiceDate}/g, invoiceData.invoiceDate)
      .replace(/{dueDate}/g, invoiceData.dueDate)
      .replace(/{totalAmount}/g, invoiceData.totalAmount)
      .replace(/{businessName}/g, settings.businessName);
  };

  // Remove logo
  const removeLogo = async () => {
    try {
      await updateSettings({ logoUri: undefined });
    } catch (error) {
      console.error('Error removing logo:', error);
      throw error;
    }
  };

  // Increment notification count
  const incrementNotificationCount = async () => {
    try {
      const currentCount = settings.notificationCount || 0;
      await updateSettings({ notificationCount: currentCount + 1 });
    } catch (error) {
      console.error('Error incrementing notification count:', error);
      throw error;
    }
  };

  // Check if should show notification (less than 3 times)
  const shouldShowNotification = () => {
    return (settings.notificationCount || 0) < 3;
  };

  return {
    settings,
    isLoading,
    updateSettings,
    formatEmailTemplate,
    removeLogo,
    incrementNotificationCount,
    shouldShowNotification,
  };
});