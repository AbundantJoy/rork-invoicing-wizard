import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
  resetCode: string;
  timestamp: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  hasCredentials: boolean;
}

const AUTH_STORAGE_KEY = 'auth_credentials';
const SESSION_STORAGE_KEY = 'auth_session';
const RESET_STORAGE_KEY = 'password_reset';

export const [AuthStoreProvider, useAuthStore] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    hasCredentials: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load auth state on app start
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        setIsLoading(true);
        
        // Check if credentials exist
        const storedCredentials = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const hasCredentials = !!storedCredentials;
        
        // Check if there's an active session (no expiry - stay logged in)
        const sessionData = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        const isAuthenticated = !!sessionData;
        
        setAuthState({ isAuthenticated, hasCredentials });
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState({ isAuthenticated: false, hasCredentials: false });
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Create initial credentials (first time setup)
  const createCredentials = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Email and password are required');
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      const credentials: AuthCredentials = {
        email: email.trim().toLowerCase(),
        password: password, // In a real app, you'd hash this
      };
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials));
      
      // Create session
      const session = {
        timestamp: new Date().getTime(),
        email: email.trim().toLowerCase(),
      };
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      
      setAuthState({ isAuthenticated: true, hasCredentials: true });
      return true;
    } catch (error) {
      console.error('Error creating credentials:', error);
      throw error;
    }
  };

  // Login with existing credentials
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const storedCredentials = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (!storedCredentials) {
        throw new Error('No credentials found');
      }
      
      const credentials: AuthCredentials = JSON.parse(storedCredentials);
      
      if (credentials.email !== email.trim().toLowerCase() || credentials.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      // Create session
      const session = {
        timestamp: new Date().getTime(),
        email: email.trim().toLowerCase(),
      };
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      
      setAuthState({ isAuthenticated: true, hasCredentials: true });
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      setAuthState(prev => ({ ...prev, isAuthenticated: false }));
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const storedCredentials = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (!storedCredentials) {
        throw new Error('No credentials found');
      }
      
      const credentials: AuthCredentials = JSON.parse(storedCredentials);
      
      if (credentials.password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }
      
      const updatedCredentials: AuthCredentials = {
        ...credentials,
        password: newPassword,
      };
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedCredentials));
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  // Generate password reset code
  const generateResetCode = async (email: string): Promise<string> => {
    try {
      const storedCredentials = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (!storedCredentials) {
        throw new Error('No account found with this email address');
      }
      
      const credentials: AuthCredentials = JSON.parse(storedCredentials);
      
      if (credentials.email !== email.trim().toLowerCase()) {
        throw new Error('No account found with this email address');
      }
      
      // Generate 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const resetData: PasswordResetData = {
        email: email.trim().toLowerCase(),
        resetCode,
        timestamp: new Date().getTime(),
      };
      
      await AsyncStorage.setItem(RESET_STORAGE_KEY, JSON.stringify(resetData));
      
      return resetCode;
    } catch (error) {
      console.error('Error generating reset code:', error);
      throw error;
    }
  };

  // Reset password with code
  const resetPasswordWithCode = async (email: string, resetCode: string, newPassword: string): Promise<boolean> => {
    try {
      const storedResetData = await AsyncStorage.getItem(RESET_STORAGE_KEY);
      
      if (!storedResetData) {
        throw new Error('No password reset request found');
      }
      
      const resetData: PasswordResetData = JSON.parse(storedResetData);
      
      // Check if reset code is expired (15 minutes)
      const now = new Date().getTime();
      const resetExpiry = resetData.timestamp + (15 * 60 * 1000);
      
      if (now > resetExpiry) {
        await AsyncStorage.removeItem(RESET_STORAGE_KEY);
        throw new Error('Reset code has expired. Please request a new one.');
      }
      
      if (resetData.email !== email.trim().toLowerCase() || resetData.resetCode !== resetCode) {
        throw new Error('Invalid reset code');
      }
      
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }
      
      // Update password
      const storedCredentials = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedCredentials) {
        throw new Error('Account not found');
      }
      
      const credentials: AuthCredentials = JSON.parse(storedCredentials);
      const updatedCredentials: AuthCredentials = {
        ...credentials,
        password: newPassword,
      };
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedCredentials));
      await AsyncStorage.removeItem(RESET_STORAGE_KEY);
      
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Get user email
  const getUserEmail = async (): Promise<string | null> => {
    try {
      const storedCredentials = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedCredentials) {
        return null;
      }
      
      const credentials: AuthCredentials = JSON.parse(storedCredentials);
      return credentials.email;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  };

  // Reset all data (for testing or complete reset)
  const resetAuth = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      await AsyncStorage.removeItem(RESET_STORAGE_KEY);
      setAuthState({ isAuthenticated: false, hasCredentials: false });
    } catch (error) {
      console.error('Error resetting auth:', error);
    }
  };

  return {
    authState,
    isLoading,
    createCredentials,
    login,
    logout,
    changePassword,
    generateResetCode,
    resetPasswordWithCode,
    getUserEmail,
    resetAuth,
  };
});