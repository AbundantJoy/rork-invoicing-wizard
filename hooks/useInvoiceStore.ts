import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

import { Client, Invoice, InvoiceStatus, LineItem, Receipt } from '@/types/invoice';
import { generateInvoiceNumber } from '@/utils/formatters';

// Storage keys
const INVOICES_STORAGE_KEY = 'invoices';
const CLIENTS_STORAGE_KEY = 'clients';

export const [InvoiceStoreProvider, useInvoiceStore] = createContextHook(() => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedInvoices = await AsyncStorage.getItem(INVOICES_STORAGE_KEY);
        const storedClients = await AsyncStorage.getItem(CLIENTS_STORAGE_KEY);
        
        if (storedInvoices) {
          setInvoices(JSON.parse(storedInvoices));
        }
        
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save invoices to AsyncStorage
  const saveInvoices = async (updatedInvoices: Invoice[]) => {
    try {
      await AsyncStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Error saving invoices:', error);
    }
  };

  // Save clients to AsyncStorage
  const saveClients = async (updatedClients: Client[]) => {
    try {
      await AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      setClients(updatedClients);
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  };

  // Generate client-specific invoice number
  const generateClientInvoiceNumber = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    const nextNumber = (client?.lastInvoiceNumber || 0) + 1;
    return nextNumber.toString().padStart(4, '0');
  };

  // Add a new invoice
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'> & { invoiceNumber?: string }) => {
    const now = new Date().toISOString();
    
    // Use provided invoice number or generate client-specific one
    const invoiceNumber = invoice.invoiceNumber || generateClientInvoiceNumber(invoice.client.id);
    
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber,
      createdAt: now,
      updatedAt: now,
    };
    
    // Update client's last invoice number
    const updatedClients = clients.map(client => 
      client.id === invoice.client.id 
        ? { ...client, lastInvoiceNumber: parseInt(invoiceNumber) }
        : client
    );
    await saveClients(updatedClients);
    
    const updatedInvoices = [...invoices, newInvoice];
    await saveInvoices(updatedInvoices);
    return newInvoice;
  };

  // Update an existing invoice
  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === id 
        ? { ...invoice, ...updates, updatedAt: new Date().toISOString() } 
        : invoice
    );
    await saveInvoices(updatedInvoices);
  };

  // Delete an invoice
  const deleteInvoice = async (id: string) => {
    const updatedInvoices = invoices.filter(invoice => invoice.id !== id);
    await saveInvoices(updatedInvoices);
  };

  // Add a new client
  const addClient = async (client: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
    };
    
    const updatedClients = [...clients, newClient];
    await saveClients(updatedClients);
    return newClient;
  };

  // Update an existing client
  const updateClient = async (id: string, updates: Partial<Client>) => {
    const updatedClients = clients.map(client => 
      client.id === id ? { ...client, ...updates } : client
    );
    await saveClients(updatedClients);
    
    // Also update client info in all invoices
    const updatedClient = updatedClients.find(client => client.id === id);
    if (updatedClient) {
      const updatedInvoices = invoices.map(invoice => 
        invoice.client.id === id 
          ? { ...invoice, client: updatedClient, updatedAt: new Date().toISOString() } 
          : invoice
      );
      await saveInvoices(updatedInvoices);
    }
  };

  // Delete a client
  const deleteClient = async (id: string) => {
    // Check if client is used in any invoices
    const clientInvoices = invoices.filter(invoice => invoice.client.id === id);
    if (clientInvoices.length > 0) {
      throw new Error('Cannot delete client with existing invoices');
    }
    
    const updatedClients = clients.filter(client => client.id !== id);
    await saveClients(updatedClients);
  };

  // Get invoices filtered by status
  const getFilteredInvoices = (status: InvoiceStatus) => {
    if (status === 'all') {
      return invoices;
    }
    return invoices.filter(invoice => 
      status === 'paid' ? invoice.isPaid : !invoice.isPaid
    );
  };

  // Get invoice counts by status
  const getInvoiceCounts = () => {
    const all = invoices.length;
    const paid = invoices.filter(invoice => invoice.isPaid).length;
    const unpaid = all - paid;
    return { all, paid, unpaid };
  };

  // Get yearly summary
  const getYearlySummary = (year: number) => {
    const yearInvoices = invoices.filter(invoice => {
      const invoiceYear = new Date(invoice.invoiceDate).getFullYear();
      return invoiceYear === year;
    });
    
    const totalAmount = yearInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paidAmount = yearInvoices
      .filter(invoice => invoice.isPaid)
      .reduce((sum, invoice) => sum + invoice.total, 0);
    const unpaidAmount = totalAmount - paidAmount;
    
    return { totalAmount, paidAmount, unpaidAmount };
  };

  // Add a receipt to an invoice
  const addReceiptToInvoice = async (invoiceId: string, receipt: Omit<Receipt, 'id'>) => {
    const newReceipt: Receipt = {
      ...receipt,
      id: Date.now().toString(),
    };
    
    const updatedInvoices = invoices.map(invoice => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          receipts: [...invoice.receipts, newReceipt],
          updatedAt: new Date().toISOString(),
        };
      }
      return invoice;
    });
    
    await saveInvoices(updatedInvoices);
    return newReceipt;
  };

  // Remove a receipt from an invoice
  const removeReceiptFromInvoice = async (invoiceId: string, receiptId: string) => {
    const updatedInvoices = invoices.map(invoice => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          receipts: invoice.receipts.filter(receipt => receipt.id !== receiptId),
          updatedAt: new Date().toISOString(),
        };
      }
      return invoice;
    });
    
    await saveInvoices(updatedInvoices);
  };

  // Create a new line item
  const createLineItem = (
    description = '',
    quantity = 1,
    unitPrice = 0
  ): LineItem => {
    return {
      id: Date.now().toString(),
      description,
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    };
  };

  return {
    invoices,
    clients,
    isLoading,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addClient,
    updateClient,
    deleteClient,
    getFilteredInvoices,
    getInvoiceCounts,
    getYearlySummary,
    addReceiptToInvoice,
    removeReceiptFromInvoice,
    createLineItem,
    generateClientInvoiceNumber,
  };
});

// Custom hook to get filtered invoices
export function useFilteredInvoices(status: InvoiceStatus) {
  const { getFilteredInvoices } = useInvoiceStore();
  return getFilteredInvoices(status);
}

// Custom hook to get invoice counts
export function useInvoiceCounts() {
  const { getInvoiceCounts } = useInvoiceStore();
  return getInvoiceCounts();
}

// Custom hook to get yearly summary
export function useYearlySummary(year: number) {
  const { getYearlySummary } = useInvoiceStore();
  return getYearlySummary(year);
}