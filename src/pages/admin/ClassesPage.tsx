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
import { Plus, Loader2, GraduationCap, Edit, Eye } from "lucide-react";

interface ClassLevel {
  id: string;
  name: string;
  classes: Array<{
    id: string;
    name: string;
    homeroomTeacher?: { user: { name: string } };
    _count: { students: number };
  }>;
}

interface Student {
  id: string;
  user: { name: string; email: string; gender: string };
}

interface Teacher {
  id: string;
  user: { name: string };
}

export default function ClassesPage() {
  const [levels, setLevels] = useState<ClassLevel[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [homeroomDialogOpen, setHomeroomDialogOpen] = useState(false);
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [newLevelName, setNewLevelName] = useState("");
  const [newClassData, setNewClassData] = useState({ name: "", levelId: "" });
  const [homeroomTeacherId, setHomeroomTeacherId] = useState("");

  useEffect(() => {
    loadData();
    loadTeachers();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/class-levels");
      const data = await res.json();
      if (data.success) setLevels(data.data);
    } catch {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await fetch("/api/admin/users?role=TEACHER");
      const data = await res.json();
      if (data.success) {
        const teacherList = data.data
          .filter((u: any) => u.teacher?.id)
          .map((u: any) => ({ id: u.teacher.id, user: { name: u.name } }));
        setTeachers(teacherList);
      }
    } catch {
      console.error("Failed to load teachers");
    }
  };

  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/class-levels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newLevelName }) });
      const data = await res.json();
      if (data.success) {
        toast.success("Grade level created");
        setLevelDialogOpen(false);
        setNewLevelName("");
        loadData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to create level");
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newClassData) });
      const data = await res.json();
      if (data.success) {
        toast.success("Class created");
        setClassDialogOpen(false);
        setNewClassData({ name: "", levelId: "" });
        loadData();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to create class");
    }
  };

  const openHomeroomDialog = (classId: string, currentTeacherId?: string) => {
    setSelectedClassId(classId);
    setHomeroomTeacherId(currentTeacherId || "");
    setHomeroomDialogOpen(true);
  };

  const handleUpdateHomeroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/classes/${selectedClassId}/homeroom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: homeroomTeacherId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Homeroom teacher updated");
        setHomeroomDialogOpen(false);
        loadData();
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update homeroom teacher");
    }
  };

  const openStudentsDialog = async (classId: string, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setStudentsDialogOpen(true);
    try {
      const res = await fetch(`/api/admin/classes/${classId}/students`);
      const data = await res.json();
      if (data.success) setClassStudents(data.data);
    } catch {
      toast.error("Failed to load students");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Class Management</h1>
          <p className="text-slate-500 mt-1">Manage grade levels and classes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
            <DialogTrigger render={<Button variant="outline">Add Grade Level</Button>} />
            <DialogContent>
              <form onSubmit={handleCreateLevel}>
                <DialogHeader><DialogTitle>Create Grade Level</DialogTitle></DialogHeader>
                <div className="py-4"><Label>Grade Name</Label><Input placeholder="e.g. Grade 1" value={newLevelName} onChange={(e) => setNewLevelName(e.target.value)} className="mt-2" /></div>
                <DialogFooter><Button type="submit">Create</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
            <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />Add Class</Button>} />
            <DialogContent>
              <form onSubmit={handleCreateClass}>
                <DialogHeader><DialogTitle>Create Class</DialogTitle><DialogDescription>Create a new class in a grade level</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div><Label>Class Name</Label><Input placeholder="e.g. 1A" value={newClassData.name} onChange={(e) => setNewClassData({ ...newClassData, name: e.target.value })} className="mt-2" /></div>
                  <div><Label>Grade Level</Label>
                    <Select value={newClassData.levelId} onValueChange={(value) => setNewClassData({ ...newClassData, levelId: value ?? '' })}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Select grade level">{levels.find(l => l.id === newClassData.levelId)?.name}</SelectValue></SelectTrigger>
                      <SelectContent>{levels.map((level) => (<SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter><Button type="submit">Create</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Homeroom Dialog */}
      <Dialog open={homeroomDialogOpen} onOpenChange={setHomeroomDialogOpen}>
        <DialogContent>
          <form onSubmit={handleUpdateHomeroom}>
            <DialogHeader><DialogTitle>Edit Homeroom Teacher</DialogTitle></DialogHeader>
            <div className="py-4">
              <Label>Select Teacher</Label>
              <Select value={homeroomTeacherId} onValueChange={(v) => setHomeroomTeacherId(v ?? '')}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select teacher">{teachers.find(t => t.id === homeroomTeacherId)?.user.name}</SelectValue></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.user.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="submit">Update</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Students Dialog */}
      <Dialog open={studentsDialogOpen} onOpenChange={setStudentsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Students in {selectedClassName}</DialogTitle></DialogHeader>
          <div className="py-4">
            {classStudents.length === 0 ? (
              <p className="text-center text-slate-500">No students in this class</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Gender</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.user.name}</TableCell>
                      <TableCell>{s.user.email}</TableCell>
                      <TableCell><Badge variant="outline">{s.user.gender}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : (
        <div className="grid gap-6">
          {levels.map((level) => (
            <Card key={level.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />{level.name}</CardTitle>
                <CardDescription>{level.classes.length} classes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Class Name</TableHead><TableHead>Homeroom Teacher</TableHead><TableHead>Students</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {level.classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.homeroomTeacher?.user?.name || "-"}</TableCell>
                        <TableCell><Badge variant="outline">{cls._count.students} students</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openStudentsDialog(cls.id, cls.name)}><Eye className="h-4 w-4 mr-1" />Students</Button>
                            <Button variant="ghost" size="sm" onClick={() => openHomeroomDialog(cls.id, cls.homeroomTeacher ? undefined : undefined)}><Edit className="h-4 w-4 mr-1" />Teacher</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {level.classes.length === 0 && (<TableRow><TableCell colSpan={4} className="text-center py-4 text-slate-500">No classes</TableCell></TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
          {levels.length === 0 && (<Card><CardContent className="py-12 text-center"><p className="text-slate-500">No grade levels yet. Create one to get started.</p></CardContent></Card>)}
        </div>
      )}
    </div>
  );
}
