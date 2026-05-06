import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { toast } from "sonner";
import { Loader2, Inbox } from "lucide-react";

interface Inquiry {
  id: string;
  parentName: string;
  studentName: string;
  phone: string;
  email?: string;
  gradeInterest: string;
  message?: string;
  status: "NEW" | "CONTACTED" | "ENROLLED" | "REJECTED";
  createdAt: string;
}

export default function FinanceInquiryPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/inquiries");
      const data = await res.json();
      if (data.success) setInquiries(data.data);
    } catch (err) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/finance/inquiries/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status updated");
        setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status: status as Inquiry['status'] } : i)));
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "NEW": return "secondary";
      case "CONTACTED": return "outline";
      case "ENROLLED": return "default";
      case "REJECTED": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inquiries</h1>
        <p className="text-slate-500 mt-1">Manage applicant inquiries from the landing page</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-emerald-600" />
              All Inquiries
            </CardTitle>
            <CardDescription>{inquiries.length} total inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.parentName}</TableCell>
                    <TableCell>{i.studentName}</TableCell>
                    <TableCell>{i.phone}</TableCell>
                    <TableCell>{i.gradeInterest}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-slate-600">{i.message || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(i.status)}>{i.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(i.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select value={i.status} onValueChange={(v) => updateStatus(i.id, v)}>
                        <SelectTrigger className="w-32 ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="CONTACTED">Contacted</SelectItem>
                          <SelectItem value="ENROLLED">Enrolled</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {inquiries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-slate-500">No inquiries found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
