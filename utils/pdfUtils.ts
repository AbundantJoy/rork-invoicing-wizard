import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { Invoice } from '@/types/invoice';
import { BusinessSettings } from '@/hooks/useSettingsStore';
import { generateInvoicePDF } from './pdfGenerator';

export interface PDFResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export async function generatePDFFile(invoice: Invoice, settings: BusinessSettings): Promise<PDFResult> {
  try {
    const htmlContent = await generateInvoicePDF(invoice, settings);
    
    if (Platform.OS === 'web') {
      // For web, create a proper PDF using the browser's print functionality
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        return { success: false, error: 'Could not open print window' };
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Add print styles and trigger print dialog
      const printStyles = `
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      `;
      
      printWindow.document.head.insertAdjacentHTML('beforeend', printStyles);
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
      
      // Also create a downloadable HTML file as fallback
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      return { success: true, uri: url };
    } else {
      // For mobile, use expo-print to generate actual PDF
      try {
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });
        
        // Move the PDF to a permanent location
        const fileName = createPDFFileName(invoice);
        if (!FileSystem.documentDirectory) {
          return { success: false, error: 'Document directory not available' };
        }
        const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.moveAsync({
          from: uri,
          to: permanentUri,
        });
        
        return { success: true, uri: permanentUri };
      } catch (printError) {
        console.error('Error generating PDF with expo-print:', printError);
        // Fallback to HTML data URI
        const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
        return { success: true, uri: dataUri };
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: 'Failed to generate PDF' };
  }
}

export function createPDFFileName(invoice: Invoice): string {
  return `Invoice_${invoice.invoiceNumber}_${invoice.client.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
}