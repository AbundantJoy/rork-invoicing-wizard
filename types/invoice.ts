export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  lastInvoiceNumber?: number;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  quantityText?: string;
  unitPriceText?: string;
}

export interface Receipt {
  id: string;
  uri: string;
  name: string;
  type: string;
  date: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber?: string;
  client: Client;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  receipts: Receipt[];
  total: number;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'all' | 'paid' | 'unpaid';