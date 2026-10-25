import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Calendar, ChevronLeft, ChevronRight, Users, Table2, Grid3x3 } from 'lucide-react';

interface MonthlySummary {
  studentId: string;
  studentName: string;
  summary: {
    PRESENT: number;
    ABSENT: number;
    SICK: number;
    PERMISSION: number;
  };
  totalDays: number;
}

interface MatrixRecord {
  studentId: string;
  studentName: string;
  records: Array<{ date: string; status: string; note: string | null }>;
}

interface Holiday {
  title: string;
  startDate: string;
  endDate: string;
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-700',
  ABSENT: 'bg-red-100 text-red-700',
  SICK: 'bg-blue-100 text-blue-700',
  PERMISSION: 'bg-purple-100 text-purple-700',
};

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Hadir',
  ABSENT: 'Alpa',
  SICK: 'Sakit',
  PERMISSION: 'Izin',
};

const MATRIX_BADGE: Record<string, string> = {
  ABSENT: 'bg-red-500',
  SICK: 'bg-blue-500',
  PERMISSION: 'bg-purple-500',
};

export default function HomeroomAttendanceMonthlyPage() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [viewMode, setViewMode] = useState<'summary' | 'matrix'>('summary');
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [matrix, setMatrix] = useState<MatrixRecord[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlySummary();
  }, [selectedMonth]);

  const loadMonthlySummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/homeroom/attendance/monthly?month=${selectedMonth}`);
      const json = await res.json();
      if (json.success) {
        setSummary(json.data);
        setMatrix(json.matrix);
        setDates(json.dates);
        setHolidays(json.holidays || []);
      }
    } catch {
      toast.error('Gagal memuat rekap bulanan');
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const getAttendanceRate = (s: MonthlySummary['summary']) => {
    const total = s.PRESENT + s.ABSENT + s.SICK + s.PERMISSION;
    if (total === 0) return 0;
    return Math.round((s.PRESENT / total) * 100);
  };

  const totalStats = summary.reduce((acc, s) => ({
    PRESENT: acc.PRESENT + s.summary.PRESENT,
    ABSENT: acc.ABSENT + s.summary.ABSENT,
    SICK: acc.SICK + s.summary.SICK,
    PERMISSION: acc.PERMISSION + s.summary.PERMISSION,
  }), { PRESENT: 0, ABSENT: 0, SICK: 0, PERMISSION: 0 });

  // Build matrix lookup: studentId -> (date -> { status, note })
  const matrixMap = new Map<string, Map<string, { status: string; note: string | null }>>();
  for (const m of matrix) {
    const dateMap = new Map<string, { status: string; note: string | null }>();
    for (const r of m.records) {
      dateMap.set(r.date, { status: r.status, note: r.note });
    }
    matrixMap.set(m.studentId, dateMap);
  }

  const getCellData = (studentId: string, date: string) => {
    return matrixMap.get(studentId)?.get(date) || null;
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}`;
  };

  const getDayShort = (dateStr: string) => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return days[new Date(dateStr).getDay()];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rekap Absensi Bulanan</h1>
            <p className="text-slate-500 mt-1">Ringkasan kehadiran siswa per bulan</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode('summary')} className={viewMode === 'summary' ? 'bg-emerald-50 text-emerald-700' : ''}>
              <Table2 className="w-4 h-4 mr-2" /> Ringkasan
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode('matrix')} className={viewMode === 'matrix' ? 'bg-emerald-50 text-emerald-700' : ''}>
              <Grid3x3 className="w-4 h-4 mr-2" /> Matriks
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/homeroom/attendance')}>
              <Calendar className="w-4 h-4 mr-2" /> Input Harian
            </Button>
          </div>
        </div>

        {/* Month selector */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <p className="text-lg font-semibold">
                {monthNames[parseInt(selectedMonth.split('-')[1]) - 1]} {selectedMonth.split('-')[0]}
              </p>
              <Button variant="ghost" size="sm" onClick={() => changeMonth(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-3 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </CardContent>
        </Card>

        {/* Class totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(totalStats).map(([key, value]) => (
            <Card key={key} className="text-center">
              <CardContent className="py-4">
                <div className={`text-2xl font-bold ${STATUS_COLORS[key].split(' ')[1]}`}>
                  {value}
                </div>
                <div className="text-xs text-slate-500 mt-1">{STATUS_LABELS[key]}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Holidays */}
        {holidays.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-3">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Libur:</span>
                {holidays.map((h, i) => (
                  <span key={i}>
                    {h.title} ({new Date(h.startDate).toLocaleDateString('id-ID')} - {new Date(h.endDate).toLocaleDateString('id-ID')})
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend for matrix */}
        {viewMode === 'matrix' && (
          <div className="flex gap-3 text-xs">
            {Object.entries(MATRIX_BADGE).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span>{STATUS_LABELS[status]}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span>Hadir</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : summary.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              Tidak ada data absensi untuk bulan ini
            </CardContent>
          </Card>
        ) : viewMode === 'summary' ? (
          /* ===== SUMMARY MODE ===== */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Detail per Siswa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-500">No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-500">Nama</th>
                    <th className="text-center px-2 py-3 font-medium text-emerald-600">Hadir</th>
                    <th className="text-center px-2 py-3 font-medium text-blue-600">Sakit</th>
                    <th className="text-center px-2 py-3 font-medium text-purple-600">Izin</th>
                    <th className="text-center px-2 py-3 font-medium text-red-600">Alpa</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-500">Total</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-500">%</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s, idx) => {
                    const rate = getAttendanceRate(s.summary);
                    return (
                      <tr key={s.studentId} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{s.studentName}</td>
                        <td className="text-center px-2 py-3">
                          <Badge className={s.summary.PRESENT > 0 ? STATUS_COLORS.PRESENT : 'bg-slate-50 text-slate-300'}>
                            {s.summary.PRESENT}
                          </Badge>
                        </td>
                        <td className="text-center px-2 py-3">
                          <Badge className={s.summary.SICK > 0 ? STATUS_COLORS.SICK : 'bg-slate-50 text-slate-300'}>
                            {s.summary.SICK}
                          </Badge>
                        </td>
                        <td className="text-center px-2 py-3">
                          <Badge className={s.summary.PERMISSION > 0 ? STATUS_COLORS.PERMISSION : 'bg-slate-50 text-slate-300'}>
                            {s.summary.PERMISSION}
                          </Badge>
                        </td>
                        <td className="text-center px-2 py-3">
                          <Badge className={s.summary.ABSENT > 0 ? STATUS_COLORS.ABSENT : 'bg-slate-50 text-slate-300'}>
                            {s.summary.ABSENT}
                          </Badge>
                        </td>
                        <td className="text-center px-4 py-3 font-medium">{s.totalDays}</td>
                        <td className="text-center px-4 py-3">
                          <span className={`font-bold ${rate >= 90 ? 'text-emerald-600' : rate >= 75 ? 'text-amber-600' : 'text-red-500'}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          /* ===== MATRIX MODE ===== */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="w-5 h-5 text-emerald-600" />
                Matriks Kehadiran
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-2 py-2 font-medium text-slate-500 sticky left-0 bg-slate-50 z-10 min-w-[140px]">Nama</th>
                    {dates.map((date) => (
                      <th key={date} className="text-center px-1 py-2 font-medium text-slate-500 min-w-[32px]">
                        <div className="leading-tight">
                          <div className="text-[10px] text-slate-400">{getDayShort(date)}</div>
                          <div>{formatDateShort(date)}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s) => (
                    <tr key={s.studentId} className="border-b hover:bg-slate-50">
                      <td className="px-2 py-2 font-medium sticky left-0 bg-white z-10 text-sm truncate max-w-[140px]">
                        {s.studentName}
                      </td>
                      {dates.map((date) => {
                        const cell = getCellData(s.studentId, date);
                        const status = cell?.status;
                        const isNonPresent = status && status !== 'PRESENT';
                        const statusLabel = status ? (STATUS_LABELS[status] ?? status) : '';
                        const tooltip = cell?.note
                          ? `${statusLabel} — ${cell.note}`
                          : statusLabel;
                        return (
                          <td key={date} className="text-center px-1 py-2">
                            {isNonPresent ? (
                              <div
                                className={`w-6 h-6 rounded-full mx-auto ${MATRIX_BADGE[status] || 'bg-slate-200'} text-white flex items-center justify-center text-[9px] font-bold`}
                                title={tooltip}
                              >
                                {status === 'SICK' ? 'S' : status === 'PERMISSION' ? 'I' : status === 'ABSENT' ? 'A' : ''}
                              </div>
                            ) : status === 'PRESENT' ? (
                              <div className="w-6 h-6 rounded-full mx-auto bg-emerald-400 text-white flex items-center justify-center text-[9px] font-bold" title={tooltip}>
                                H
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full mx-auto bg-slate-100" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
