export interface Invoice {
  id: string;
  studentId: string;
  title: string;
  description?: string | null;
  amount: number;
  paidAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  type: string;
  dueDate: string;
  paidAt: string | null;
  month: number | null;
  year: number | null;
  student: {
    id: string;
    user: { name: string; email: string };
    class: { name: string; level?: { name: string } } | null;
  };
  payments: Array<{
    id: string;
    amount: number;
    method: string | null;
    note: string | null;
    paymentDate: string;
    createdAt: string;
  }>;
}

export interface Payment {
  id: string;
  invoiceId: string | null;
  studentId: string;
  amount: number;
  method: string | null;
  note: string | null;
  paymentDate: string;
  createdAt: string;
  invoice?: { title: string } | null;
  student?: { user: { name: string } };
}

export interface FinancialReport {
  totalInvoices: number;
  totalExpected: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    student: { user: { name: string } };
    createdAt: string;
  }>;
}
