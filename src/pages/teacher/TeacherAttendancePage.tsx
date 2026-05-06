import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Calendar, CheckCircle, XCircle, AlertCircle, Clock, Save, AlertTriangle, BookOpen } from 'lucide-react';

interface StudentAttendance {
  id: string;
  user: { name: string };
  attendances: { status: string }[];
}

interface ScheduleInfo {
  subjectName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Hadir', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'ABSENT', label: 'Tidak Hadir', icon: XCircle, color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'SICK', label: 'Sakit', icon: AlertCircle, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'LATE', label: 'Terlambat', icon: Clock, color: 'bg-blue-50 text-blue-700 border-blue-200' },
];

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState<ScheduleInfo | null>(null);
  const [scheduleValid, setScheduleValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      validateAndLoad();
    }
  }, [selectedClass, selectedDate]);

  const loadClasses = async () => {
    try {
      const res = await fetch('/api/teacher/classes');
      const json = await res.json();
      if (json.success) {
        const allClasses = json.data.flatMap((l: any) => l.classes);
        setClasses(allClasses);
        if (allClasses.length > 0) setSelectedClass(allClasses[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const validateAndLoad = async () => {
    setValidating(true);
    setScheduleValid(null);
    setScheduleInfo(null);
    try {
      // Validate schedule first
      const validateRes = await fetch(`/api/teacher/attendance/validate/${selectedClass}/${selectedDate}`);
      const validateJson = await validateRes.json();

      if (validateJson.success && validateJson.data.valid) {
        setScheduleValid(true);
        setScheduleInfo({
          subjectName: validateJson.data.schedule.subject.name,
          startTime: validateJson.data.schedule.startTime,
          endTime: validateJson.data.schedule.endTime,
          dayOfWeek: validateJson.data.schedule.dayOfWeek,
        });
        await loadAttendance();
      } else {
        setScheduleValid(false);
        setStudents([]);
        setAttendanceMap({});
      }
    } catch (err) {
      console.error(err);
      setScheduleValid(false);
    } finally {
      setValidating(false);
    }
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/attendance/${selectedClass}/${selectedDate}`);
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
        const map: Record<string, string> = {};
        json.data.forEach((s: StudentAttendance) => {
          map[s.id] = s.attendances[0]?.status || 'PRESENT';
        });
        setAttendanceMap(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!scheduleValid) {
      toast.error('Tidak dapat menyimpan absensi: jadwal tidak valid');
      return;
    }
    setSaving(true);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        date: new Date(selectedDate).toISOString(),
        status,
        note: '',
      }));

      for (const record of records) {
        await fetch('/api/teacher/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }

      toast.success('Absensi berhasil disimpan');
      loadAttendance();
    } catch (err) {
      toast.error('Gagal menyimpan absensi');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'ABSENT').length;
  const total = students.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Absensi Kelas</h1>
            <p className="text-slate-500 mt-1">Catat kehadiran siswa per hari</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        {/* Schedule validation banner */}
        {validating ? (
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="py-4 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              <span className="text-slate-600">Memvalidasi jadwal...</span>
            </CardContent>
          </Card>
        ) : scheduleValid === false ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Tidak dapat mengisi absensi</p>
                <p className="text-sm text-red-600">Anda tidak memiliki jadwal mengajar untuk kelas ini pada hari {DAYS[new Date(selectedDate).getDay()]}.</p>
              </div>
            </CardContent>
          </Card>
        ) : scheduleValid === true && scheduleInfo ? (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="py-4 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">Jadwal Valid</p>
                <p className="text-sm text-emerald-600">
                  {scheduleInfo.subjectName} | {DAYS[new Date(selectedDate).getDay()]} | {scheduleInfo.startTime} - {scheduleInfo.endTime}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-slate-500">Total Siswa</div>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-slate-500">Hadir</div>
              <div className="text-2xl font-bold text-emerald-600">{presentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="text-sm text-slate-500">Tidak Hadir</div>
              <div className="text-2xl font-bold text-red-500">{absentCount}</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : scheduleValid === true ? (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Siswa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors">
                  <span className="font-medium">{student.user.name}</span>
                  <div className="flex gap-1">
                    {STATUS_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = attendanceMap[student.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setAttendanceMap(prev => ({ ...prev, [student.id]: opt.value }))}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive ? opt.color : 'bg-slate-50 text-slate-400 border border-transparent hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-center text-slate-500 py-4">Tidak ada siswa di kelas ini</p>
              )}
            </CardContent>
          </Card>
        ) : null}

        {scheduleValid === true && (
          <Button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Absensi
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
}
