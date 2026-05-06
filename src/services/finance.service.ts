import type { Invoice, Payment, FinancialReport } from '../interfaces/finance.types.js';

const API_BASE = '/api/finance';

class FinanceService {
  async getInvoices(studentId?: string, status?: string, page = 1, limit = 10): Promise<{ data: Invoice[]; total: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (studentId) params.append('studentId', studentId);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/invoices?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data || data;
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const res = await fetch(`${API_BASE}/invoices/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async createInvoice(data: { studentId: string; title: string; amount: number; type: string; dueDate: string; description?: string }): Promise<Invoice> {
    const res = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async createTargetedInvoices(data: {
    targetType: 'CLASS' | 'STUDENT';
    classId?: string;
    studentIds?: string[];
    title: string;
    description?: string;
    amount: number;
    type: string;
    dueDate: string;
  }): Promise<Invoice[]> {
    const res = await fetch(`${API_BASE}/invoices/targeted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async updateInvoice(id: string, data: Partial<{ title: string; amount: number; status: string }>): Promise<Invoice> {
    const res = await fetch(`${API_BASE}/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete invoice');
  }

  async processPayment(data: {
    invoiceId: string;
    studentId: string;
    amount: number;
    method?: string;
    note?: string;
    paymentDate?: string;
  }): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    const res = await fetch(`${API_BASE}/invoices/${invoiceId}/payments`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getPaymentHistory(studentId: string): Promise<Payment[]> {
    const res = await fetch(`${API_BASE}/payments/student/${studentId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getFinancialReport(year?: number, month?: number): Promise<FinancialReport> {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    const res = await fetch(`${API_BASE}/reports?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const res = await fetch(`${API_BASE}/overdue`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async markAsPaid(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/invoices/${id}/mark-paid`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark invoice as paid');
  }
}

export const financeService = new FinanceService();
