import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { toast } from "sonner";
import { Loader2, DollarSign, Plus, CreditCard, History, Search, Receipt } from "lucide-react";
// Types inlined to avoid module resolution issue in this file
interface Invoice {
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

interface Payment {
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

interface Report {
  totalInvoices: number;
  totalExpected: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  recentPayments: Payment[];
}

interface ClassOption {
  id: string;
  name: string;
  level?: { name: string };
}

interface StudentOption {
  id: string;
  name: string;
  className?: string;
}

export default function FinanceOverview() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [overdue, setOverdue] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  // Invoice creation state
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoiceTargetType, setInvoiceTargetType] = useState<'CLASS' | 'STUDENT'>('CLASS');
  const [invoiceForm, setInvoiceForm] = useState({
    title: "",
    description: "",
    amount: 0,
    type: "TUITION",
    dueDate: "",
    classId: "",
    studentIds: [] as string[],
  });
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [invoiceCreating, setInvoiceCreating] = useState(false);

  // Payment state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: "CASH",
    note: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Payment history state
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyPayments, setHistoryPayments] = useState<Payment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, limit, statusFilter]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [clsRes, stuRes] = await Promise.all([
          fetch("/api/finance/classes"),
          fetch("/api/finance/students"),
        ]);
        const [clsJson, stuJson] = await Promise.all([clsRes.json(), stuRes.json()]);
        if (clsJson.success) {
          const allClasses = clsJson.data.flatMap((l: any) =>
            l.classes.map((c: any) => ({ id: c.id, name: c.name, level: l }))
          );
          setClasses(allClasses);
        }
        if (stuJson.success) {
          setStudents(
            stuJson.data.map((s: any) => ({
              id: s.id,
              name: s.user.name,
              className: s.class?.name || "",
            }))
          );
        }
      } catch { /* silent */ }
    };
    loadMeta();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (statusFilter) params.append("status", statusFilter);

      const [invoicesRes, reportRes, overdueRes] = await Promise.all([
        fetch(`/api/finance/invoices?${params}`),
        fetch("/api/finance/reports"),
        fetch("/api/finance/overdue"),
      ]);
      const [invoicesData, reportData, overdueData] = await Promise.all([
        invoicesRes.json(),
        reportRes.json(),
        overdueRes.json(),
      ]);

      if (invoicesData.success) setInvoices(invoicesData.data);
      if (reportData.success) setReport(reportData.data);
      if (overdueData.success) setOverdue(overdueData.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.title || !invoiceForm.amount || !invoiceForm.dueDate) {
      toast.error("Please fill all required fields"); return;
    }
    setInvoiceCreating(true);
    try {
      const res = await fetch("/api/finance/invoices/targeted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: invoiceTargetType,
          classId: invoiceForm.classId,
          studentIds: invoiceForm.studentIds,
          title: invoiceForm.title,
          description: invoiceForm.description,
          amount: invoiceForm.amount,
          type: invoiceForm.type,
          dueDate: invoiceForm.dueDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.count} invoice(s) created`);
        setInvoiceDialogOpen(false);
        resetInvoiceForm();
        loadData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to create invoice");
    } finally { setInvoiceCreating(false); }
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({ title: "", description: "", amount: 0, type: "TUITION", dueDate: "", classId: "", studentIds: [] });
    setInvoiceTargetType("CLASS");
  };

  const openPaymentDialog = (invoice: Invoice) => {
    const remaining = invoice.amount - invoice.paidAmount;
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: remaining > 0 ? remaining : 0,
      method: "CASH",
      note: "",
      paymentDate: new Date().toISOString().split("T")[0],
    });
    setPaymentDialogOpen(true);
  };

  const getPaymentButtonLabel = (invoice: Invoice) => {
    if (invoice.status === "PAID") return "Add Payment";
    if (invoice.paidAmount === 0) return "Record Full Payment";
    return "Record Partial Payment";
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (paymentForm.amount <= 0) { toast.error("Amount must be greater than 0"); return; }

    const remaining = selectedInvoice.amount - selectedInvoice.paidAmount;
    if (paymentForm.amount > remaining) {
      toast.error(`Amount exceeds remaining balance of ${remaining}`); return;
    }

    setPaymentLoading(true);
    try {
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          studentId: selectedInvoice.studentId,
          amount: paymentForm.amount,
          method: paymentForm.method,
          note: paymentForm.note,
          paymentDate: paymentForm.paymentDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment recorded successfully");
        setPaymentDialogOpen(false);
        setSelectedInvoice(null);
        loadData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to record payment");
    } finally { setPaymentLoading(false); }
  };

  const openHistory = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setHistoryDialogOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/finance/invoices/${invoice.id}/payments`);
      const data = await res.json();
      if (data.success) setHistoryPayments(data.data);
      else setHistoryPayments([]);
    } catch {
      setHistoryPayments([]);
    } finally { setHistoryLoading(false); }
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.student.user.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil((invoices.length > 0 ? (report?.totalInvoices || 0) : 0) / limit);

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string; label: string }> = {
      PAID: { variant: "default", color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Paid" },
      PARTIAL: { variant: "outline", color: "bg-amber-50 text-amber-700 border-amber-200", label: "Partially Paid" },
      UNPAID: { variant: "destructive", color: "bg-red-50 text-red-700 border-red-200", label: "Unpaid" },
    };
    const s = map[status] || map.UNPAID;
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Finance Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage invoices, payments, and financial reports</p>
        </div>
        <Button onClick={() => { resetInvoiceForm(); setInvoiceDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Expected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {report?.totalExpected.toLocaleString("id-ID") || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Rp {report?.totalCollected.toLocaleString("id-ID") || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rp {report?.totalOutstanding.toLocaleString("id-ID") || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.collectionRate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={(open) => { if (!open) resetInvoiceForm(); setInvoiceDialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Generate invoices for a class or specific students</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 min-h-0">
            {/* Target Type */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="targetType" checked={invoiceTargetType === 'CLASS'} onChange={() => setInvoiceTargetType('CLASS')} className="accent-emerald-600" />
                <span className="text-sm font-medium text-slate-700">Entire Class</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="targetType" checked={invoiceTargetType === 'STUDENT'} onChange={() => setInvoiceTargetType('STUDENT')} className="accent-emerald-600" />
                <span className="text-sm font-medium text-slate-700">Specific Students</span>
              </label>
            </div>

            {invoiceTargetType === 'CLASS' && (
              <div className="space-y-2">
                <Label>Select Class</Label>
                <Select value={invoiceForm.classId} onValueChange={(v) => setInvoiceForm((prev) => ({ ...prev, classId: v ?? '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class">
                      {(() => {
                        const c = classes.find((x) => x.id === invoiceForm.classId);
                        return c ? `${c.level?.name} - ${c.name}` : "Choose a class";
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.level?.name} - {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {invoiceTargetType === 'STUDENT' && (
              <div className="space-y-2">
                <Label>Select Students</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto border rounded-xl p-3">
                  {students.map((s) => (
                    <label key={s.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${invoiceForm.studentIds.includes(s.id) ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}>
                      <input
                        type="checkbox"
                        checked={invoiceForm.studentIds.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInvoiceForm((prev) => ({ ...prev, studentIds: [...prev.studentIds, s.id] }));
                          } else {
                            setInvoiceForm((prev) => ({ ...prev, studentIds: prev.studentIds.filter((id) => id !== s.id) }));
                          }
                        }}
                        className="accent-emerald-600"
                      />
                      <span className="text-sm truncate">{s.name}</span>
                    </label>
                  ))}
                </div>
                {invoiceForm.studentIds.length > 0 && (
                  <p className="text-xs text-slate-500">{invoiceForm.studentIds.length} student(s) selected</p>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input value={invoiceForm.title} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g., SPP Januari 2026" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={invoiceForm.type} onValueChange={(v) => setInvoiceForm((prev) => ({ ...prev, type: v ?? '' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUITION">Tuition (SPP)</SelectItem>
                    <SelectItem value="ACTIVITIES">Activities</SelectItem>
                    <SelectItem value="BOOKS">Books</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={invoiceForm.description} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Optional description" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (Rp) <span className="text-red-500">*</span></Label>
                <Input type="number" value={invoiceForm.amount || ""} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, amount: Number(e.target.value) }))} placeholder="500000" />
              </div>
              <div className="space-y-2">
                <Label>Due Date <span className="text-red-500">*</span></Label>
                <Input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm((prev) => ({ ...prev, dueDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 pt-2 gap-2 shrink-0 border-t border-slate-100">
            <Button variant="outline" onClick={() => { setInvoiceDialogOpen(false); resetInvoiceForm(); }}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={invoiceCreating} className="bg-emerald-600 hover:bg-emerald-700">
              {invoiceCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Receipt className="h-4 w-4 mr-2" />}
              Create Invoice(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <>
                  Invoice: <span className="font-medium">{selectedInvoice.title}</span>
                  <br />
                  Student: <span className="font-medium">{selectedInvoice.student.user.name}</span>
                  <br />
                  Total: Rp {selectedInvoice.amount.toLocaleString("id-ID")} | Remaining: <span className="text-red-600 font-medium">Rp {(selectedInvoice.amount - selectedInvoice.paidAmount).toLocaleString("id-ID")}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Payment Amount (Rp) <span className="text-red-500">*</span></Label>
              <Input type="number" min={1} step={1} value={paymentForm.amount || ""} onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: Number(e.target.value) }))} required />
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm((prev) => ({ ...prev, method: v ?? '' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="QR">QR Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={paymentForm.note} onChange={(e) => setPaymentForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Optional notes" />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={paymentLoading} className="bg-emerald-600 hover:bg-emerald-700">
                {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <DollarSign className="h-4 w-4 mr-2" />}
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <>
                  {selectedInvoice.title} — {selectedInvoice.student.user.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-2 min-h-0">
            {historyLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : historyPayments.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No payments recorded yet</p>
            ) : (
              <div className="space-y-3">
                {historyPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Rp {p.amount.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-slate-500">{p.method} • {new Date(p.paymentDate).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                    {p.note && <p className="text-xs text-slate-400 max-w-[120px] truncate">{p.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="p-6 pt-2 shrink-0 border-t border-slate-100">
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>All Invoices</CardTitle>
                  <CardDescription>Track billing and payment status</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search student or title..." className="pl-9 w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value ?? ''); setPage(1); }}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="UNPAID">Unpaid</SelectItem>
                      <SelectItem value="PARTIAL">Partial</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => {
                    const remaining = inv.amount - inv.paidAmount;
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.student.user.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{inv.title}</span>
                            <span className="text-xs text-slate-400">{inv.student.class?.name || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">Rp {inv.amount.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-right text-emerald-600">Rp {inv.paidAmount.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">Rp {remaining.toLocaleString("id-ID")}</TableCell>
                        <TableCell>{new Date(inv.dueDate).toLocaleDateString("id-ID")}</TableCell>
                        <TableCell>{statusBadge(inv.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openHistory(inv)}>
                              <History className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openPaymentDialog(inv)}>
                              {getPaymentButtonLabel(inv)}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">No invoices found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Rows per page</span>
                  <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[10, 25, 50, 100].map((s) => (<SelectItem key={s} value={s.toString()}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader><CardTitle>Overdue Invoices</CardTitle><CardDescription>Invoices past their due date that are not fully paid</CardDescription></CardHeader>
            <CardContent>
              {overdue.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No overdue invoices</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdue.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.student.user.name}</TableCell>
                        <TableCell>{inv.title}</TableCell>
                        <TableCell className="text-right">Rp {inv.amount.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-right text-emerald-600">Rp {inv.paidAmount.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">Rp {(inv.amount - inv.paidAmount).toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-red-600">{new Date(inv.dueDate).toLocaleDateString("id-ID")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report?.recentPayments?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.student?.user?.name || "—"}</TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">+Rp {p.amount.toLocaleString("id-ID")}</TableCell>
                      <TableCell><Badge variant="outline">{p.method}</Badge></TableCell>
                      <TableCell>{new Date(p.createdAt).toLocaleDateString("id-ID")}</TableCell>
                    </TableRow>
                  ))}
                  {(!report?.recentPayments || report.recentPayments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">No payments</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
