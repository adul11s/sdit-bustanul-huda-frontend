import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../../components/ui/sheet";
import { toast } from "sonner";
import { Loader2, BarChart3, Clock, Calendar } from "lucide-react";

interface ScheduleDetail {
  id: string;
  className: string;
  subjectName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  durationHours: number;
}

interface WorkloadDetail {
  summary: {
    teacherId: string;
    teacherName: string;
    averageWeeklyHours: number;
    weekly: Array<{ weekStart: string; weekEnd: string; totalHours: number; scheduleCount: number }>;
    monthly: Array<{ year: number; month: number; totalHours: number; scheduleCount: number }>;
  };
  schedules: ScheduleDetail[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminWorkloadPage() {
  const [workloads, setWorkloads] = useState<Array<{ teacherId: string; teacherName: string; averageWeeklyHours: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [, setSelectedTeacherId] = useState<string | null>(null);
  const [detail, setDetail] = useState<WorkloadDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadWorkloads();
  }, []);

  const loadWorkloads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workload");
      const data = await res.json();
      if (data.success) setWorkloads(data.data);
    } catch {
      toast.error("Failed to load workload data");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setDialogOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/workload/${teacherId}/detail`);
      const data = await res.json();
      if (data.success) setDetail(data.data);
    } catch {
      toast.error("Failed to load workload detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const totalYearHours = (summary: WorkloadDetail["summary"]) => {
    return summary.monthly.reduce((sum, m) => sum + m.totalHours, 0);
  };

  const totalSchedules = (summary: WorkloadDetail["summary"]) => {
    return summary.weekly.reduce((sum, w) => sum + w.scheduleCount, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Teacher Workload</h1>
        <p className="text-slate-500 mt-1">Overview of teaching hours and schedule distribution</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-600" />All Teachers</CardTitle>
            <CardDescription>{workloads.length} teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Teacher</TableHead><TableHead>Avg Weekly Hours</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {workloads.map((w) => (
                  <TableRow key={w.teacherId}>
                    <TableCell className="font-medium">{w.teacherName}</TableCell>
                    <TableCell>{w.averageWeeklyHours.toFixed(1)} hrs</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openDetails(w.teacherId)}>Details</Button></TableCell>
                  </TableRow>
                ))}
                {workloads.length === 0 && (<TableRow><TableCell colSpan={3} className="text-center py-4 text-slate-500">No workload data</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent side="right" className="w-full sm:w-3/4 lg:w-2/3 p-0">
          <SheetHeader className="p-6 pb-2 border-b">
            <SheetTitle>{detail?.summary.teacherName} - Workload Detail</SheetTitle>
            <SheetDescription>Teaching hours, schedules, and monthly breakdown</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
          {detailLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Summary stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Avg Weekly</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{detail.summary.averageWeeklyHours.toFixed(1)} hrs</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Yearly Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalYearHours(detail.summary).toFixed(1)} hrs</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Schedules</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalSchedules(detail.summary)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Unique Classes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{new Set(detail.schedules.map(s => s.className)).size}</div></CardContent></Card>
              </div>

              {/* Schedule details */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Calendar className="h-5 w-5 text-emerald-600" />Schedule Details</h3>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Class</TableHead><TableHead>Subject</TableHead><TableHead>Day</TableHead><TableHead>Time</TableHead><TableHead>Duration</TableHead><TableHead>Room</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.schedules.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.className}</TableCell>
                        <TableCell>{s.subjectName}</TableCell>
                        <TableCell><Badge variant="outline">{DAYS[s.dayOfWeek]}</Badge></TableCell>
                        <TableCell>{s.startTime} - {s.endTime}</TableCell>
                        <TableCell>{s.durationHours.toFixed(1)} hrs</TableCell>
                        <TableCell>{s.room || "-"}</TableCell>
                      </TableRow>
                    ))}
                    {detail.schedules.length === 0 && (<TableRow><TableCell colSpan={6} className="text-center py-4 text-slate-500">No schedules</TableCell></TableRow>)}
                  </TableBody>
                </Table>
              </div>

              {/* Monthly breakdown */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Clock className="h-5 w-5 text-emerald-600" />Monthly Breakdown</h3>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Month</TableHead><TableHead>Total Hours</TableHead><TableHead>Schedule Count</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.summary.monthly.map((m) => (
                      <TableRow key={m.month}>
                        <TableCell className="font-medium">{new Date(m.year, m.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</TableCell>
                        <TableCell>{m.totalHours.toFixed(1)} hrs</TableCell>
                        <TableCell>{m.scheduleCount}</TableCell>
                      </TableRow>
                    ))}
                    {detail.summary.monthly.length === 0 && (<TableRow><TableCell colSpan={3} className="text-center py-4 text-slate-500">No monthly data</TableCell></TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
