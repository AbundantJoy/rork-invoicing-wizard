import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Invoice } from '@/types/invoice';

export interface CSVExportData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  lineItemsDescription: string;
  lineItemsQuantity: string;
  lineItemsUnitPrice: string;
  lineItemsAmount: string;
  total: string;
  isPaid: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function formatLineItems(invoice: Invoice): {
  descriptions: string;
  quantities: string;
  unitPrices: string;
  amounts: string;
} {
  const descriptions = invoice.lineItems.map(item => item.description).join('; ');
  const quantities = invoice.lineItems.map(item => item.quantity.toString()).join('; ');
  const unitPrices = invoice.lineItems.map(item => `$${item.unitPrice.toFixed(2)}`).join('; ');
  const amounts = invoice.lineItems.map(item => `$${item.amount.toFixed(2)}`).join('; ');
  
  return {
    descriptions,
    quantities,
    unitPrices,
    amounts,
  };
}

function convertInvoicesToCSVData(invoices: Invoice[]): CSVExportData[] {
  return invoices.map(invoice => {
    const lineItems = formatLineItems(invoice);
    
    return {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.client.name,
      clientEmail: invoice.client.email,
      clientPhone: invoice.client.phone || '',
      clientAddress: invoice.client.address || '',
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      poNumber: invoice.poNumber || '',
      lineItemsDescription: lineItems.descriptions,
      lineItemsQuantity: lineItems.quantities,
      lineItemsUnitPrice: lineItems.unitPrices,
      lineItemsAmount: lineItems.amounts,
      total: `$${invoice.total.toFixed(2)}`,
      isPaid: invoice.isPaid ? 'Yes' : 'No',
      notes: invoice.notes || '',
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  });
}

function generateCSVContent(data: CSVExportData[]): string {
  const headers = [
    'Invoice Number',
    'Client Name',
    'Client Email',
    'Client Phone',
    'Client Address',
    'Invoice Date',
    'Due Date',
    'PO Number',
    'Line Items Description',
    'Line Items Quantity',
    'Line Items Unit Price',
    'Line Items Amount',
    'Total',
    'Is Paid',
    'Notes',
    'Created At',
    'Updated At',
  ];
  
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = [
      escapeCSVField(row.invoiceNumber),
      escapeCSVField(row.clientName),
      escapeCSVField(row.clientEmail),
      escapeCSVField(row.clientPhone),
      escapeCSVField(row.clientAddress),
      escapeCSVField(row.invoiceDate),
      escapeCSVField(row.dueDate),
      escapeCSVField(row.poNumber),
      escapeCSVField(row.lineItemsDescription),
      escapeCSVField(row.lineItemsQuantity),
      escapeCSVField(row.lineItemsUnitPrice),
      escapeCSVField(row.lineItemsAmount),
      escapeCSVField(row.total),
      escapeCSVField(row.isPaid),
      escapeCSVField(row.notes),
      escapeCSVField(row.createdAt),
      escapeCSVField(row.updatedAt),
    ];
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

export async function exportInvoicesToCSV(invoices: Invoice[]): Promise<void> {
  try {
    if (invoices.length === 0) {
      throw new Error('No invoices to export');
    }
    
    const csvData = convertInvoicesToCSVData(invoices);
    const csvContent = generateCSVContent(csvData);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `invoices_export_${timestamp}.csv`;
    
    if (Platform.OS === 'web') {
      // Web download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Mobile sharing
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: 'utf8',
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Invoices CSV',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    }
  } catch (error) {
    console.error('Error exporting invoices to CSV:', error);
    throw error;
  }
}

export function getExportSummary(invoices: Invoice[]): {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  dateRange: { start: string; end: string } | null;
} {
  if (invoices.length === 0) {
    return {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      dateRange: null,
    };
  }
  
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = invoices
    .filter(invoice => invoice.isPaid)
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const unpaidAmount = totalAmount - paidAmount;
  
  const sortedDates = invoices
    .map(invoice => new Date(invoice.invoiceDate))
    .sort((a, b) => a.getTime() - b.getTime());
  
  const dateRange = {
    start: sortedDates[0].toLocaleDateString(),
    end: sortedDates[sortedDates.length - 1].toLocaleDateString(),
  };
  
  return {
    totalInvoices: invoices.length,
    totalAmount,
    paidAmount,
    unpaidAmount,
    dateRange,
  };
}