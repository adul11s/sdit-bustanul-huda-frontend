import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Loader2, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  subject: { name: string };
  class: { name: string; level: { name: string } };
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function TeacherSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const res = await fetch('/api/teacher/schedule');
      const json = await res.json();
      if (json.success) setSchedules(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  const grouped = schedules.reduce((acc, s) => {
    if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
    acc[s.dayOfWeek].push(s);
    return acc;
  }, {} as Record<number, ScheduleItem[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jadwal Mengajar</h1>
          <p className="text-slate-500 mt-1">Jadwal kelas yang Anda ajar minggu ini</p>
        </div>

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
                {grouped[day]?.map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-emerald-900">{s.subject.name}</span>
                      <Badge variant="outline" className="text-xs">{s.class.name}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {s.startTime} - {s.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {s.room}
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-slate-400 text-center py-4">Tidak ada jadwal</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
