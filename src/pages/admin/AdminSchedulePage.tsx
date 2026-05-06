import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subject: { id: string; name: string; teacher: { user: { name: string } } };
  class: { id: string; name: string; level: { name: string } };
  academicYear?: { name: string };
}

interface SubjectItem {
  id: string;
  name: string;
  teacher: { user: { name: string } };
}

interface ClassLevel {
  id: string;
  name: string;
  classes: Array<{ id: string; name: string }>;
}

interface AcademicYearItem {
  id: string;
  name: string;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [levels, setLevels] = useState<ClassLevel[]>([]);
  const [years, setYears] = useState<AcademicYearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);

  const [filters, setFilters] = useState<{ classId: string; academicYearId: string }>({ classId: "", academicYearId: "" });
  const [form, setForm] = useState({
    subjectId: "",
    classId: "",
    dayOfWeek: "1",
    startTime: "",
    endTime: "",
    room: "",
    academicYearId: "",
  });

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    if (filters.classId && filters.academicYearId) {
      loadSchedules();
    } else {
      setSchedules([]);
      setLoading(false);
    }
  }, [filters]);

  const loadMeta = async () => {
    try {
      const [subjectsRes, levelsRes, yearsRes] = await Promise.all([
        fetch("/api/admin/subjects"),
        fetch("/api/admin/class-levels"),
        fetch("/api/admin/academic-years"),
      ]);
      const [subjectsData, levelsData, yearsData] = await Promise.all([
        subjectsRes.json(), levelsRes.json(), yearsRes.json()
      ]);
      if (subjectsData.success) setSubjects(subjectsData.data);
      if (levelsData.success) setLevels(levelsData.data);
      if (yearsData.success) setYears(yearsData.data);
    } catch (err) {
      toast.error("Failed to load metadata");
    }
  };

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.classId) params.append("classId", filters.classId);
      if (filters.academicYearId) params.append("academicYearId", filters.academicYearId);
      const res = await fetch(`/api/admin/schedules?${params}`);
      const data = await res.json();
      if (data.success) setSchedules(data.data);
    } catch (err) {
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    try {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dayOfWeek: Number(form.dayOfWeek),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Schedule created");
        setDialogOpen(false);
        setForm({ subjectId: "", classId: "", dayOfWeek: "1", startTime: "", endTime: "", room: "", academicYearId: "" });
        loadSchedules();
      } else if (data.errors) {
        setValidationErrors(data.errors);
        toast.error("Validation failed. Please check the errors.");
      } else {
        toast.error(data.error || "Failed to create schedule");
      }
    } catch (err) {
      toast.error("Failed to create schedule");
    }
  };

  const grouped = schedules.reduce((acc, s) => {
    if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
    acc[s.dayOfWeek].push(s);
    return acc;
  }, {} as Record<number, ScheduleItem[]>);

  const allClasses = levels.flatMap((l) => l.classes.map((c) => ({ ...c, levelName: l.name })));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Schedule Management</h1>
          <p className="text-slate-500 mt-1">Create and view class schedules</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />Add Schedule</Button>} />
          <DialogContent className="max-w-lg">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Schedule</DialogTitle>
                <DialogDescription>Assign a subject to a class time slot</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {validationErrors.length > 0 && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 space-y-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertCircle className="h-4 w-4" /> Validation Errors
                    </div>
                    {validationErrors.map((e, i) => (
                      <div key={i}>• {e.message}</div>
                    ))}
                  </div>
                )}
                <div>
                  <Label>Academic Year</Label>
                  <Select value={form.academicYearId} onValueChange={(v) => setForm({ ...form, academicYearId: v })}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select year">{years.find(y => y.id === form.academicYearId)?.name}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Class</Label>
                  <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select class">{allClasses.find(c => c.id === form.classId)?.levelName} - {allClasses.find(c => c.id === form.classId)?.name}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {allClasses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.levelName} - {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select subject">{subjects.find(s => s.id === form.subjectId)?.name}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.teacher.user.name})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Day</Label>
                  <Select value={form.dayOfWeek} onValueChange={(v) => setForm({ ...form, dayOfWeek: v })}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder="Select day" /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="mt-2" />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="mt-2" />
                  </div>
                </div>
                <div>
                  <Label>Room</Label>
                  <Input placeholder="e.g. Room 101" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="mt-2" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Select value={filters.classId} onValueChange={(v) => setFilters({ ...filters, classId: v })}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select class">{allClasses.find(c => c.id === filters.classId)?.levelName} - {allClasses.find(c => c.id === filters.classId)?.name}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {allClasses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.levelName} - {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.academicYearId} onValueChange={(v) => setFilters({ ...filters, academicYearId: v })}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select academic year">{years.find(y => y.id === filters.academicYearId)?.name}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : !filters.classId || !filters.academicYearId ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">Select a class and academic year to view schedules</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((day) => (
            <Card key={day} className="border-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  {DAYS[day - 1]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {grouped[day]?.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-emerald-900">{s.subject.name}</span>
                      <Badge variant="outline" className="text-xs">{s.class.name}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 mb-1">Teacher: {s.subject.teacher?.user?.name ?? "-"}</div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {s.startTime} - {s.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {s.room || "-"}
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-slate-400 text-center py-4">No schedules</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
