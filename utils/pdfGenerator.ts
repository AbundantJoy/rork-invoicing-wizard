import { Invoice } from '@/types/invoice';
import { BusinessSettings } from '@/hooks/useSettingsStore';
import { formatCurrency, formatDate } from './formatters';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Helper function to convert local file URIs to base64 data URIs
async function convertReceiptToDataUri(receiptUri: string): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      // For web, if it's already a data URI or HTTP URL, return as is
      if (receiptUri.startsWith('data:') || receiptUri.startsWith('http')) {
        return receiptUri;
      }
      // For web blob URLs, return as is
      if (receiptUri.startsWith('blob:')) {
        return receiptUri;
      }
    } else {
      // For mobile, convert file URI to base64
      if (receiptUri.startsWith('file://')) {
        const base64 = await FileSystem.readAsStringAsync(receiptUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Determine MIME type based on file extension
        const extension = receiptUri.split('.').pop()?.toLowerCase();
        let mimeType = 'image/jpeg'; // default
        if (extension === 'png') mimeType = 'image/png';
        else if (extension === 'gif') mimeType = 'image/gif';
        else if (extension === 'webp') mimeType = 'image/webp';
        
        return `data:${mimeType};base64,${base64}`;
      }
    }
    
    // If it's already a data URI or HTTP URL, return as is
    return receiptUri;
  } catch (error) {
    console.error('Error converting receipt to data URI:', error);
    // Return a placeholder or the original URI
    return receiptUri;
  }
}

export async function generateInvoicePDF(invoice: Invoice, settings: BusinessSettings): Promise<string> {
  // Convert all receipt URIs to data URIs for better compatibility
  const processedReceipts = await Promise.all(
    invoice.receipts.map(async (receipt) => ({
      ...receipt,
      uri: await convertReceiptToDataUri(receipt.uri)
    }))
  );
  
  // Convert logo URI to data URI if it exists
  let processedLogoUri = settings.logoUri;
  if (settings.logoUri) {
    processedLogoUri = await convertReceiptToDataUri(settings.logoUri);
  }
  
  const invoiceWithProcessedReceipts = {
    ...invoice,
    receipts: processedReceipts
  };
  
  const processedSettings = {
    ...settings,
    logoUri: processedLogoUri
  };
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #${invoiceWithProcessedReceipts.invoiceNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        .business-info {
            flex: 1;
        }
        .business-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-bottom: 10px;
            display: block;
        }
        .business-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .business-details {
            font-size: 14px;
            color: #666;
            white-space: pre-line;
        }
        .invoice-title {
            text-align: right;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        .invoice-logo {
            width: 100px;
            height: 100px;
            object-fit: contain;
            margin-bottom: 10px;
        }
        .invoice-number {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin: 0;
        }
        .invoice-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            margin-top: 10px;
        }
        .status-paid {
            background-color: #10b981;
        }
        .status-unpaid {
            background-color: #f59e0b;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .client-info, .dates-info {
            flex: 1;
        }
        .client-info {
            margin-right: 40px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
        }
        .client-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .client-details {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
        }
        .date-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .date-label {
            color: #666;
        }
        .date-value {
            font-weight: 500;
        }
        .line-items {
            margin-bottom: 30px;
        }
        .line-items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .line-items-table th {
            background-color: #f8fafc;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            color: #374151;
            border-bottom: 2px solid #e2e8f0;
        }
        .line-items-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .line-items-table th:nth-child(2),
        .line-items-table td:nth-child(2),
        .line-items-table th:nth-child(3),
        .line-items-table td:nth-child(3),
        .line-items-table th:nth-child(4),
        .line-items-table td:nth-child(4) {
            text-align: center;
            width: 80px;
        }
        .line-items-table th:nth-child(4),
        .line-items-table td:nth-child(4) {
            text-align: right;
        }
        .total-section {
            text-align: right;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #2563eb;
        }
        .total-row {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
        }
        .notes-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .notes-content {
            font-size: 14px;
            color: #666;
            white-space: pre-line;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .receipts-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .receipts-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 15px;
        }
        .receipt-item {
            text-align: center;
            max-width: 200px;
        }
        .receipt-image {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .receipt-name {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
            word-break: break-word;
        }
        .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="business-info">
            ${processedSettings.logoUri ? `<img src="${processedSettings.logoUri}" alt="Business Logo" class="business-logo" onerror="this.style.display='none'" />` : ''}
            <div class="business-name">${processedSettings.businessName}</div>
            ${processedSettings.businessAddress ? `<div class="business-details">${processedSettings.businessAddress}</div>` : ''}
            ${processedSettings.businessPhone ? `<div class="business-details">Phone: ${processedSettings.businessPhone}</div>` : ''}
            ${processedSettings.businessEmail ? `<div class="business-details">Email: ${processedSettings.businessEmail}</div>` : ''}
        </div>
        <div class="invoice-title">
            <div class="invoice-label">INVOICE</div>
            <div class="invoice-number">#${invoiceWithProcessedReceipts.invoiceNumber}</div>
            <div class="status-badge ${invoiceWithProcessedReceipts.isPaid ? 'status-paid' : 'status-unpaid'}">
                ${invoiceWithProcessedReceipts.isPaid ? 'PAID' : 'UNPAID'}
            </div>
        </div>
    </div>

    <div class="invoice-details">
        <div class="client-info">
            <div class="section-title">Bill To</div>
            <div class="client-name">${invoiceWithProcessedReceipts.client.name}</div>
            ${invoiceWithProcessedReceipts.client.email ? `<div class="client-details">${invoiceWithProcessedReceipts.client.email}</div>` : ''}
            ${invoiceWithProcessedReceipts.client.phone ? `<div class="client-details">${invoiceWithProcessedReceipts.client.phone}</div>` : ''}
            ${invoiceWithProcessedReceipts.client.address ? `<div class="client-details">${invoiceWithProcessedReceipts.client.address}</div>` : ''}
        </div>
        
        <div class="dates-info">
            <div class="section-title">Invoice Details</div>
            <div class="date-row">
                <span class="date-label">Invoice Date:</span>
                <span class="date-value">${formatDate(invoiceWithProcessedReceipts.invoiceDate)}</span>
            </div>
            <div class="date-row">
                <span class="date-label">Due Date:</span>
                <span class="date-value">${formatDate(invoiceWithProcessedReceipts.dueDate)}</span>
            </div>
        </div>
    </div>

    <div class="line-items">
        <div class="section-title">Services</div>
        <table class="line-items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceWithProcessedReceipts.lineItems.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td>${formatCurrency(item.amount)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="total-section">
            <div class="total-row">
                Total: ${formatCurrency(invoiceWithProcessedReceipts.total)}
            </div>
        </div>
    </div>

    ${invoiceWithProcessedReceipts.receipts && invoiceWithProcessedReceipts.receipts.length > 0 ? `
        <div class="receipts-section">
            <div class="section-title">Receipts</div>
            <div class="receipts-grid">
                ${invoiceWithProcessedReceipts.receipts.map(receipt => `
                    <div class="receipt-item">
                        <img src="${receipt.uri}" alt="${receipt.name}" class="receipt-image" onerror="this.style.display='none'" />
                        <div class="receipt-name">${receipt.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : ''}

    ${invoiceWithProcessedReceipts.notes ? `
        <div class="notes-section">
            <div class="section-title">Notes</div>
            <div class="notes-content">${invoiceWithProcessedReceipts.notes}</div>
        </div>
    ` : ''}

    <div class="footer">
        <div>Thank you for your business!</div>
        ${processedSettings.businessName ? `<div>${processedSettings.businessName}</div>` : ''}
    </div>
</body>
</html>`;

  return htmlContent;
}