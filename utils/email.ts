import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { Platform } from 'react-native';

import { Client, Invoice } from '@/types/invoice';
import { BusinessSettings } from '@/hooks/useSettingsStore';
import { formatCurrency, formatDate } from './formatters';
import { generatePDFFile, createPDFFileName } from './pdfUtils';

export async function sendInvoiceEmail(invoice: Invoice, client: Client): Promise<boolean> {
  try {
    const subject = `Invoice #${invoice.invoiceNumber} from Your Business`;
    
    const body = `
Dear ${client.name},

Please find attached Invoice #${invoice.invoiceNumber} for your review.

Invoice Details:
- Invoice Date: ${formatDate(invoice.invoiceDate)}
- Due Date: ${formatDate(invoice.dueDate)}
- Total Amount: ${formatCurrency(invoice.total)}

Please let me know if you have any questions.

Thank you for your business!

Best regards,
Your Business
`;

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const encodedTo = encodeURIComponent(client.email);

    let url = '';
    if (Platform.OS === 'ios') {
      url = `mailto:${encodedTo}?subject=${encodedSubject}&body=${encodedBody}`;
    } else {
      url = `mailto:${encodedTo}?subject=${encodedSubject}&body=${encodedBody}`;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      console.log('Cannot open email app');
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendInvoiceEmailWithPDF(invoice: Invoice, settings: BusinessSettings): Promise<boolean> {
  try {
    const subject = `Invoice #${invoice.invoiceNumber} from ${settings.businessName}`;
    
    // Format the email template with invoice data
    const body = settings.emailTemplate
      .replace(/{clientName}/g, invoice.client.name)
      .replace(/{invoiceNumber}/g, invoice.invoiceNumber)
      .replace(/{invoiceDate}/g, formatDate(invoice.invoiceDate))
      .replace(/{dueDate}/g, formatDate(invoice.dueDate))
      .replace(/{totalAmount}/g, formatCurrency(invoice.total))
      .replace(/{businessName}/g, settings.businessName);

    if (Platform.OS === 'web') {
      // For web, generate PDF and create download link
      const pdfResult = await generatePDFFile(invoice, settings);
      
      if (pdfResult.success && pdfResult.uri) {
        // Create a downloadable PDF link
        const link = document.createElement('a');
        link.href = pdfResult.uri;
        link.download = `Invoice_${invoice.invoiceNumber}.pdf`;
        
        // Add the link to body temporarily and click it to download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Open email with instructions
        const emailBodyWithInstructions = `${body}\n\n📎 IMPORTANT: A PDF invoice has been downloaded to your computer. Please attach the downloaded PDF file (Invoice_${invoice.invoiceNumber}.pdf) to this email before sending.\n\nThe PDF contains the complete invoice with all details and receipts.`;
        const encodedBodyWithInstructions = encodeURIComponent(emailBodyWithInstructions);
        const encodedSubject = encodeURIComponent(subject);
        const encodedTo = encodeURIComponent(invoice.client.email);
        
        const url = `mailto:${encodedTo}?subject=${encodedSubject}&body=${encodedBodyWithInstructions}`;
        
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return true;
        }
      }
    } else {
      // For mobile, use expo-mail-composer for better email handling with attachments
      const pdfResult = await generatePDFFile(invoice, settings);
      
      if (pdfResult.success && pdfResult.uri) {
        try {
          // Check if mail composer is available
          const isAvailable = await MailComposer.isAvailableAsync();
          if (isAvailable) {
            // Use mail composer with pre-filled content and PDF attachment
            const result = await MailComposer.composeAsync({
              recipients: [invoice.client.email],
              subject: subject,
              body: body,
              isHtml: false,
              attachments: [pdfResult.uri],
            });
            
            // MailComposer returns a result indicating if email was sent, saved, or cancelled
            return result.status === MailComposer.MailComposerStatus.SENT || 
                   result.status === MailComposer.MailComposerStatus.SAVED;
          }
        } catch (mailError) {
          console.error('Error using mail composer:', mailError);
          // Fall through to sharing approach
        }
        
        // Fallback: Use sharing API
        try {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(pdfResult.uri, {
              mimeType: 'application/pdf',
              dialogTitle: `Email Invoice #${invoice.invoiceNumber}`,
              UTI: 'com.adobe.pdf',
            });
            return true;
          }
        } catch (shareError) {
          console.error('Error sharing PDF:', shareError);
        }
      }
    }
    
    // Final fallback: Use mailto with detailed invoice information in email body
    const detailedBody = `${body}\n\n📋 INVOICE DETAILS\n\nInvoice #${invoice.invoiceNumber}\nClient: ${invoice.client.name}\nInvoice Date: ${formatDate(invoice.invoiceDate)}\nDue Date: ${formatDate(invoice.dueDate)}\n\n📝 LINE ITEMS:\n${invoice.lineItems.map((item, index) => 
      `${index + 1}. ${item.description}\n   Quantity: ${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.amount)}`
    ).join('\n\n')}\n\n💰 TOTAL: ${formatCurrency(invoice.total)}\n📊 STATUS: ${invoice.isPaid ? '✅ PAID' : '⏳ UNPAID'}\n\n${invoice.notes ? `📝 NOTES:\n${invoice.notes}\n\n` : ''}${invoice.receipts.length > 0 ? `📎 RECEIPTS: ${invoice.receipts.length} receipt(s) available` : ''}`;

    const finalEncodedBody = encodeURIComponent(detailedBody);
    const encodedSubject = encodeURIComponent(subject);
    const encodedTo = encodeURIComponent(invoice.client.email);
    const url = `mailto:${encodedTo}?subject=${encodedSubject}&body=${finalEncodedBody}`;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      console.log('Cannot open email app');
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Error sending email with PDF:', error);
    return false;
  }
}

// Email utility for password recovery
export async function sendPasswordResetEmail(email: string, resetCode: string): Promise<boolean> {
  try {
    const subject = 'Password Reset Request - Invoice App';
    
    const body = `Hello,

You have requested to reset your password for the Invoice App.

Your password reset code is: ${resetCode}

This code will expire in 15 minutes for security reasons.

If you did not request this password reset, please ignore this email.

Best regards,
Invoice App`;

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const encodedTo = encodeURIComponent(email);

    const url = `mailto:${encodedTo}?subject=${encodedSubject}&body=${encodedBody}`;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      console.log('Cannot open email app');
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}