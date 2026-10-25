import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, ChevronLeft, ChevronRight, Trash2, CalendarDays } from "lucide-react";
import { useAuth } from "../lib/auth-context";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  description?: string;
  affectsAttendance: boolean;
  affectsWorkload: boolean;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  HOLIDAY: "bg-red-100 text-red-800 border-red-200",
  STUDY_TOUR: "bg-purple-100 text-purple-800 border-purple-200",
  CLASS_MEETING: "bg-blue-100 text-blue-800 border-blue-200",
  COMPETITION: "bg-amber-100 text-amber-800 border-amber-200",
  SCIENCE_OLYMPIAD: "bg-cyan-100 text-cyan-800 border-cyan-200",
  EXAM_PERIOD: "bg-orange-100 text-orange-800 border-orange-200",
  CUSTOM: "bg-slate-100 text-slate-800 border-slate-200",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  HOLIDAY: "Holiday",
  STUDY_TOUR: "Study Tour",
  CLASS_MEETING: "Class Meeting",
  COMPETITION: "Competition",
  SCIENCE_OLYMPIAD: "Science Olympiad",
  EXAM_PERIOD: "Exam Period",
  CUSTOM: "Custom",
};

export default function CalendarPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    id: "",
    title: "",
    type: "CUSTOM",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    description: "",
    affectsAttendance: false,
    affectsWorkload: false,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? "/api/admin/calendar-events" : "/api/calendar/events";
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) setEvents(data.data);
    } catch {
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = form.id ? `/api/admin/calendar-events/${form.id}` : "/api/admin/calendar-events";
      const method = form.id ? "PUT" : "POST";
      const { id: _id, ...payload } = form;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(form.id ? "Event updated" : "Event created");
        setDialogOpen(false);
        resetForm();
        loadEvents();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save event");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/calendar-events/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Event deleted");
        loadEvents();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      title: "",
      type: "CUSTOM",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      description: "",
      affectsAttendance: false,
      affectsWorkload: false,
    });
  };

  const openCreate = () => {
    resetForm();
    if (selectedDate) {
      setForm((f) => ({
        ...f,
        startDate: format(selectedDate, "yyyy-MM-dd"),
        endDate: format(selectedDate, "yyyy-MM-dd"),
      }));
    }
    setDialogOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setForm({
      id: event.id,
      title: event.title,
      type: event.type,
      startDate: format(new Date(event.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(event.endDate), "yyyy-MM-dd"),
      description: event.description || "",
      affectsAttendance: event.affectsAttendance,
      affectsWorkload: event.affectsWorkload,
    });
    setDialogOpen(true);
  };

  // Calendar grid generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((e) => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Academic Calendar</h1>
            <p className="text-slate-500 mt-1">
              {isAdmin
                ? "Manage school events, holidays, and academic schedule"
                : "View school events, holidays, and academic schedule"}
            </p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Event</Button>} />
              <DialogContent className="max-w-lg">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{form.id ? "Edit Event" : "Create Event"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? '' })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                          className="mt-2"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Affects Attendance (blocks marking)</Label>
                      <Switch
                        checked={form.affectsAttendance}
                        onCheckedChange={(v) => setForm({ ...form, affectsAttendance: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer">Affects Workload (excludes from hours)</Label>
                      <Switch
                        checked={form.affectsWorkload}
                        onCheckedChange={(v) => setForm({ ...form, affectsWorkload: v })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{form.id ? "Update" : "Create"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
            <Badge key={type} variant="outline" className={EVENT_TYPE_COLORS[type]}>
              {label}
            </Badge>
          ))}
        </div>

        {/* Calendar Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, idx) => {
                    const dayEvents = getEventsForDate(date);
                    const current = isSameMonth(date, currentMonth);
                    const today = isSameDay(date, new Date());
                    const selected = selectedDate && isSameDay(date, selectedDate);
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          min-h-[80px] p-1.5 rounded-lg border cursor-pointer transition-all
                          ${current ? "bg-white" : "bg-slate-50 text-slate-400"}
                          ${today ? "ring-2 ring-emerald-500" : ""}
                          ${selected ? "bg-emerald-50 border-emerald-300" : "border-slate-100 hover:border-slate-300"}
                        `}
                      >
                        <div className={`text-sm font-medium ${today ? "text-emerald-600" : ""}`}>
                          {format(date, "d")}
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {dayEvents.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className={`text-[10px] truncate px-1 py-0.5 rounded ${EVENT_TYPE_COLORS[e.type]}`}
                              title={e.title}
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[10px] text-slate-400 pl-1">
                              +{dayEvents.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected date events */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Events on {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const dayEvents = getEventsForDate(selectedDate);
                if (dayEvents.length === 0) {
                  return <p className="text-slate-500 text-sm">No events on this date</p>;
                }
                return (
                  <div className="space-y-3">
                    {dayEvents.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-start justify-between p-3 rounded-lg border bg-white"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={EVENT_TYPE_COLORS[e.type]}>
                              {EVENT_TYPE_LABELS[e.type]}
                            </Badge>
                            {e.affectsAttendance && (
                              <Badge variant="outline" className="text-red-600">
                                Blocks Attendance
                              </Badge>
                            )}
                            {e.affectsWorkload && (
                              <Badge variant="outline" className="text-orange-600">
                                Excludes Workload
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-slate-900">{e.title}</h4>
                          {e.description && (
                            <p className="text-sm text-slate-500">{e.description}</p>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(e)}>
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDelete(e.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
