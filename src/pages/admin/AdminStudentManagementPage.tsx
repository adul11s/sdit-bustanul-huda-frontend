import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import { toast } from "sonner";
import { Loader2, UserPlus, ArrowRightLeft, History } from "lucide-react";

interface Student {
  id: string;
  user: { name: string; email: string; gender: string };
  class?: { name: string; level: { name: string } };
}

interface ClassLevel {
  id: string;
  name: string;
  classes: Array<{ id: string; name: string; levelId: string }>;
}

interface TransferHistoryEntry {
  id: string;
  fromClassName: string | null;
  toClassName: string;
  transferredAt: string;
  reason: string | null;
}

export default function AdminStudentManagementPage() {
  const [levels, setLevels] = useState<ClassLevel[]>([]);
  const [unassigned, setUnassigned] = useState<Student[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("unassigned");

  const [selectedClassId, setSelectedClassId] = useState("");

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [history, setHistory] = useState<TransferHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [assignForm, setAssignForm] = useState({ studentId: "", classId: "" });
  const [transferForm, setTransferForm] = useState({ studentId: "", toClassId: "", reason: "" });

  useEffect(() => {
    loadMeta();
    loadUnassigned();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassStudents();
    } else {
      setClassStudents([]);
    }
  }, [selectedClassId]);

  const loadMeta = async () => {
    try {
      const res = await fetch("/api/admin/class-levels");
      const data = await res.json();
      if (data.success) setLevels(data.data);
    } catch (err) {
      toast.error("Failed to load classes");
    }
  };

  const loadUnassigned = async () => {
    try {
      const res = await fetch("/api/admin/students/unassigned");
      const data = await res.json();
      if (data.success) setUnassigned(data.data);
    } catch (err) {
      toast.error("Failed to load unassigned students");
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/classes/${selectedClassId}/students`);
      const data = await res.json();
      if (data.success) setClassStudents(data.data);
    } catch (err) {
      toast.error("Failed to load class students");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/students/${assignForm.studentId}/assign-class`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: assignForm.classId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Student assigned to class");
        setAssignDialogOpen(false);
        setAssignForm({ studentId: "", classId: "" });
        loadUnassigned();
      } else {
        toast.error(data.error || "Failed to assign student");
      }
    } catch (err) {
      toast.error("Failed to assign student");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/students/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Student transferred");
        setTransferDialogOpen(false);
        setTransferForm({ studentId: "", toClassId: "", reason: "" });
        loadClassStudents();
      } else {
        toast.error(data.error || "Failed to transfer student");
      }
    } catch (err) {
      toast.error("Failed to transfer student");
    }
  };

  const loadHistory = async (studentId: string) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/transfer-history`);
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistory = (studentId: string) => {
    loadHistory(studentId);
    setHistoryDialogOpen(true);
  };

  const allClasses = levels.flatMap((l) => l.classes.map((c) => ({ ...c, levelName: l.name })));

  const getStudentLevelId = (studentId: string) => {
    const student = classStudents.find((s) => s.id === studentId);
    if (student?.class) {
      const cls = allClasses.find((c) => c.name === student.class?.name && c.levelName === student.class?.level?.name);
      return cls?.levelId;
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Student Class Management</h1>
        <p className="text-slate-500 mt-1">Assign and transfer students between classes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unassigned">Unassigned Students</TabsTrigger>
          <TabsTrigger value="rosters">Class Rosters</TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Unassigned Students</CardTitle>
                <CardDescription>Students not yet assigned to any class</CardDescription>
              </div>
              <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogTrigger render={<Button><UserPlus className="mr-2 h-4 w-4" />Assign to Class</Button>} />
                <DialogContent>
                  <form onSubmit={handleAssign}>
                    <DialogHeader>
                      <DialogTitle>Assign Student to Class</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Student</Label>
                        <Select value={assignForm.studentId} onValueChange={(v) => setAssignForm({ ...assignForm, studentId: v })}>
                          <SelectTrigger className="mt-2"><SelectValue placeholder="Select student">{unassigned.find(s => s.id === assignForm.studentId)?.user.name}</SelectValue></SelectTrigger>
                          <SelectContent>
                            {unassigned.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.user.name} ({s.user.email})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Class</Label>
                        <Select value={assignForm.classId} onValueChange={(v) => setAssignForm({ ...assignForm, classId: v })}>
                          <SelectTrigger className="mt-2"><SelectValue placeholder="Select class">{allClasses.find(c => c.id === assignForm.classId)?.levelName} - {allClasses.find(c => c.id === assignForm.classId)?.name}</SelectValue></SelectTrigger>
                          <SelectContent>
                            {allClasses.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.levelName} - {c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Assign</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
              ) : unassigned.length === 0 ? (
                <p className="text-center py-8 text-slate-500">All students are assigned to classes</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Gender</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassigned.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.user.name}</TableCell>
                        <TableCell>{s.user.email}</TableCell>
                        <TableCell><Badge variant="outline">{s.user.gender}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rosters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Rosters</CardTitle>
              <CardDescription>Select a class to view and manage its students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-72"><SelectValue placeholder="Select class">{allClasses.find(c => c.id === selectedClassId)?.levelName} - {allClasses.find(c => c.id === selectedClassId)?.name}</SelectValue></SelectTrigger>
                <SelectContent>
                  {allClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.levelName} - {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClassId && (
                <>
                  {loading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
                  ) : classStudents.length === 0 ? (
                    <p className="text-center py-8 text-slate-500">No students in this class</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classStudents.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.user.name}</TableCell>
                            <TableCell>{s.user.email}</TableCell>
                            <TableCell><Badge variant="outline">{s.user.gender}</Badge></TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => openHistory(s.id)}>
                                  <History className="h-3.5 w-3.5 mr-1" /> History
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  setTransferForm({ studentId: s.id, toClassId: "", reason: "" });
                                  setTransferDialogOpen(true);
                                }}>
                                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> Transfer
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <form onSubmit={handleTransfer}>
            <DialogHeader>
              <DialogTitle>Transfer Student</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Student</Label>
                <Select value={transferForm.studentId} onValueChange={(v) => setTransferForm({ ...transferForm, studentId: v })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select student">{classStudents.find(s => s.id === transferForm.studentId)?.user.name}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {classStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To Class (same grade level only)</Label>
                <Select value={transferForm.toClassId} onValueChange={(v) => setTransferForm({ ...transferForm, toClassId: v })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select target class">{allClasses.find(c => c.id === transferForm.toClassId)?.levelName} - {allClasses.find(c => c.id === transferForm.toClassId)?.name}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {allClasses
                      .filter((c) => c.levelId === getStudentLevelId(transferForm.studentId))
                      .filter((c) => c.id !== selectedClassId)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.levelName} - {c.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reason</Label>
                <Input placeholder="Optional reason" value={transferForm.reason} onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })} className="mt-2" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer History</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {historyLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
            ) : history.length === 0 ? (
              <p className="text-center text-slate-500">No transfer history found</p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{h.fromClassName || "Unassigned"}</span>
                      <ArrowRightLeft className="h-3 w-3 text-slate-400" />
                      <span className="font-medium text-emerald-700">{h.toClassName}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(h.transferredAt).toLocaleDateString()} • {h.reason || "No reason"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
