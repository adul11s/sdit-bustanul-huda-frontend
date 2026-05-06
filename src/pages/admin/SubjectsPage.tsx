import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, BookOpen, Edit } from "lucide-react";

interface Teacher {
  id: string;
  user: { name: string; email: string };
}

interface Subject {
  id: string;
  name: string;
  code?: string;
  teacher: { user: { name: string }; id: string };
  _count: { enrollments: number; assignments: number; exams: number };
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", teacherId: "" });
  const [editForm, setEditForm] = useState({ id: "", name: "", code: "", teacherId: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, usersRes] = await Promise.all([
        fetch("/api/admin/subjects"),
        fetch("/api/admin/users?role=TEACHER"),
      ]);
      const [subjectsData, usersData] = await Promise.all([subjectsRes.json(), usersRes.json()]);
      if (subjectsData.success) setSubjects(subjectsData.data);
      if (usersData.success) {
        const teacherList = usersData.data
          .filter((u: any) => u.teacher?.id)
          .map((u: any) => ({ id: u.teacher.id, user: { name: u.name, email: u.email } }));
        setTeachers(teacherList);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) {
        toast.success("Subject created");
        setCreateDialogOpen(false);
        setFormData({ name: "", code: "", teacherId: "" });
        loadData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to create subject");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/subjects/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, code: editForm.code, teacherId: editForm.teacherId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Subject updated");
        setEditDialogOpen(false);
        loadData();
      } else {
        toast.error(data.error || "Failed to update subject");
      }
    } catch (error) {
      toast.error("Failed to update subject");
    }
  };

  const openEdit = (subject: Subject) => {
    setEditForm({ id: subject.id, name: subject.name, code: subject.code || "", teacherId: subject.teacher?.id || "" });
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Subject Management</h1>
          <p className="text-slate-500 mt-1">Manage subjects and assign teachers</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />Add Subject</Button>} />
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader><DialogTitle>Create Subject</DialogTitle><DialogDescription>Create a new subject and assign a teacher</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div><Label>Subject Name</Label><Input placeholder="e.g. Mathematics" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-2" /></div>
                <div><Label>Subject Code (Optional)</Label><Input placeholder="e.g. MATH" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="mt-2" /></div>
                <div><Label>Teacher</Label>
                  <Select value={formData.teacherId} onValueChange={(value) => setFormData({ ...formData, teacherId: value })}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select teacher">{teachers.find(t => t.id === formData.teacherId)?.user.name}</SelectValue></SelectTrigger>
                    <SelectContent>{teachers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.user.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button type="submit">Create</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader><DialogTitle>Edit Subject</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Subject Name</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="mt-2" /></div>
              <div><Label>Subject Code</Label><Input value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} className="mt-2" /></div>
              <div><Label>Teacher</Label>
                <Select value={editForm.teacherId} onValueChange={(value) => setEditForm({ ...editForm, teacherId: value })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select teacher">{teachers.find(t => t.id === editForm.teacherId)?.user.name}</SelectValue></SelectTrigger>
                  <SelectContent>{teachers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.user.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />All Subjects</CardTitle>
          <CardDescription>{subjects.length} subjects</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Teacher</TableHead><TableHead>Enrollments</TableHead><TableHead>Assignments</TableHead><TableHead>Exams</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell><Badge variant="outline">{subject.code || "-"}</Badge></TableCell>
                    <TableCell>{subject.teacher?.user?.name || "-"}</TableCell>
                    <TableCell>{subject._count.enrollments}</TableCell>
                    <TableCell>{subject._count.assignments}</TableCell>
                    <TableCell>{subject._count.exams}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(subject)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {subjects.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No subjects yet</TableCell></TableRow>)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
