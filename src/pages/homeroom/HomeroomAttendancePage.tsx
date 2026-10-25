import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Save, Calendar, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface StudentAttendance {
  id: string;
  user: { id: string; name: string; gender: string };
  attendances: Array<{ id: string; status: string; note: string | null }>;
}

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'SICK', label: 'Sakit', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'PERMISSION', label: 'Izin', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'ABSENT', label: 'Alpa', color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function HomeroomAttendancePage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [records, setRecords] = useState<Record<string, { status: string; note: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/homeroom/attendance?date=${selectedDate}`);
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
        const map: Record<string, { status: string; note: string }> = {};
        json.data.forEach((s: StudentAttendance) => {
          if (s.attendances.length > 0) {
            map[s.id] = { status: s.attendances[0].status, note: s.attendances[0].note || '' };
          }
        });
        setRecords(map);
      }
    } catch {
      toast.error('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { note: '' }), status },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { status: 'PRESENT' }), note },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(records).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        note: data.note || undefined,
      }));

      const res = await fetch('/api/homeroom/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, records: payload }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Absensi tersimpan: ${json.count} siswa`);
      } else {
        toast.error(json.error || 'Gagal menyimpan');
      }
    } catch {
      toast.error('Gagal menyimpan absensi');
    } finally {
      setSaving(false);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getDayName = (dateStr: string) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date(dateStr).getDay()];
  };

  const isWeekend = (dateStr: string) => {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
  };

  const filledCount = Object.keys(records).length;
  const totalCount = students.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Absensi Harian</h1>
            <p className="text-slate-500 mt-1">Catat kehadiran siswa per hari</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/homeroom/attendance/monthly')}>
            <Calendar className="w-4 h-4 mr-2" /> Rekap Bulanan
          </Button>
        </div>

        {/* Date selector */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <p className="text-lg font-semibold">{getDayName(selectedDate)}, {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {isWeekend(selectedDate) && (
                  <Badge variant="secondary" className="mt-1">Akhir Pekan</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => changeDate(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-3 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CheckCircle className="w-4 h-4" />
          {filledCount} dari {totalCount} siswa tercatat
          {filledCount === totalCount && totalCount > 0 && (
            <Badge variant="default" className="text-[10px]">Lengkap</Badge>
          )}
        </div>

        {/* Attendance table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              Tidak ada siswa di kelas ini
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {students.map((student, idx) => {
              const record = records[student.id];
              const selectedStatus = record?.status;

              return (
                <Card key={student.id} className={selectedStatus ? 'border-emerald-200' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                       <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{student.user.name}</p>
                          <p className="text-xs text-slate-400">{student.user.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                          {student.attendances[0]?.note && (
                            <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                              <span className="font-medium">Catatan:</span> {student.attendances[0].note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1 flex-wrap justify-end">
                          {STATUS_OPTIONS.map((opt) => (
                            <Button
                              key={opt.value}
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(student.id, opt.value)}
                              className={`text-[10px] px-2 py-1 h-7 rounded-lg border transition-all ${
                                selectedStatus === opt.value
                                  ? opt.color + ' ring-2 ring-offset-1'
                                  : 'border-slate-100 text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Catatan (opsional)"
                          value={record?.note || ''}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          className="w-48 px-2 py-1 text-xs rounded border border-slate-200"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Absensi
        </Button>
      </div>
    </DashboardLayout>
  );
}
