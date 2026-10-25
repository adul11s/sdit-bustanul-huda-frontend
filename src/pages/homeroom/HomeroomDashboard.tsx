import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Loader2, Users, TrendingUp, Calendar, CreditCard, GraduationCap, Eye, ArrowLeft, BookOpen } from 'lucide-react';

interface Student {
  id: string;
  user: { name: string; email: string };
}

interface HomeroomClass {
  id: string;
  name: string;
  level: { name: string };
  students: Student[];
}

interface GradeItem {
  value: number;
  subject: { name: string };
  assignment?: { title: string } | null;
  exam?: { title: string } | null;
  category?: string;
  createdAt: string;
}

interface StudentDetail {
  user: { name: string; email: string; gender: string };
  class: { name: string; level: { name: string } };
  grades: GradeItem[];
  attendances: { date: string; status: string }[];
  invoices: { title: string; amount: number; status: string; dueDate: string }[];
  submissions: { exam: { title: string; subject: { name: string } }; status: string; totalScore?: number; percentage?: number }[];
}

interface SubjectGradeGroup {
  subjectName: string;
  assignments: Array<{ label: string; value: number }>;
  exams: Array<{ label: string; value: number }>;
  finalGrade: number;
}

export default function HomeroomDashboard() {
  const [homeroomClass, setHomeroomClass] = useState<HomeroomClass | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeroomClass();
  }, []);

  const loadHomeroomClass = async () => {
    try {
      const res = await fetch('/api/teacher/homeroom/class');
      const json = await res.json();
      if (json.success) setHomeroomClass(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewStudent = async (studentId: string) => {
    try {
      const res = await fetch(`/api/teacher/homeroom/student/${studentId}`);
      const json = await res.json();
      if (json.success) setSelectedStudent(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Group grades by subject with assignment/exam breakdown
  const getGroupedGrades = (grades: GradeItem[]): SubjectGradeGroup[] => {
    const map = new Map<string, SubjectGradeGroup>();

    for (const g of grades) {
      const subjectName = g.subject.name;
      if (!map.has(subjectName)) {
        map.set(subjectName, { subjectName, assignments: [], exams: [], finalGrade: 0 });
      }
      const group = map.get(subjectName)!;

      if (g.assignment) {
        group.assignments.push({ label: g.assignment.title, value: g.value });
      } else if (g.exam) {
        group.exams.push({ label: g.exam.title, value: g.value });
      }
    }

    // Calculate final grade per subject (average of all items)
    for (const group of map.values()) {
      const allScores = [...group.assignments.map(a => a.value), ...group.exams.map(e => e.value)];
      group.finalGrade = allScores.length > 0
        ? Math.round((allScores.reduce((s, v) => s + v, 0) / allScores.length) * 10) / 10
        : 0;
    }

    return Array.from(map.values());
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

  if (!homeroomClass) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Anda belum ditugaskan sebagai wali kelas</p>
        </div>
      </DashboardLayout>
    );
  }

  if (selectedStudent) {
    const groupedGrades = getGroupedGrades(selectedStudent.grades);
    const presentCount = selectedStudent.attendances.filter(a => a.status === 'PRESENT').length;
    const totalBills = selectedStudent.invoices.reduce((sum, i) => sum + i.amount, 0);
    const unpaidBills = selectedStudent.invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + i.amount, 0);

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center font-bold text-2xl text-emerald-600">
              {selectedStudent.user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{selectedStudent.user.name}</h1>
              <p className="text-slate-500">{selectedStudent.class.level.name} - {selectedStudent.class.name}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="py-4"><div className="text-sm text-slate-500">Rata-rata</div><div className="text-2xl font-bold text-emerald-600">{groupedGrades.length > 0 ? (groupedGrades.reduce((s, g) => s + g.finalGrade, 0) / groupedGrades.length).toFixed(1) : '0'}</div></CardContent></Card>
            <Card><CardContent className="py-4"><div className="text-sm text-slate-500">Kehadiran</div><div className="text-2xl font-bold text-emerald-600">{presentCount}x</div></CardContent></Card>
            <Card><CardContent className="py-4"><div className="text-sm text-slate-500">Total Tagihan</div><div className="text-2xl font-bold text-slate-700">Rp {totalBills.toLocaleString()}</div></CardContent></Card>
            <Card><CardContent className="py-4"><div className="text-sm text-slate-500">Belum Lunas</div><div className="text-2xl font-bold text-red-500">Rp {unpaidBills.toLocaleString()}</div></CardContent></Card>
          </div>

          <Tabs defaultValue="grades">
            <TabsList>
              <TabsTrigger value="grades"><TrendingUp className="w-4 h-4 mr-1" /> Nilai</TabsTrigger>
              <TabsTrigger value="attendance"><Calendar className="w-4 h-4 mr-1" /> Absensi</TabsTrigger>
              <TabsTrigger value="exams"><GraduationCap className="w-4 h-4 mr-1" /> Ujian</TabsTrigger>
              <TabsTrigger value="bills"><CreditCard className="w-4 h-4 mr-1" /> Tagihan</TabsTrigger>
            </TabsList>

            <TabsContent value="grades" className="space-y-4">
              {groupedGrades.length === 0 && (
                <Card><CardContent className="py-8 text-center text-slate-500">Belum ada nilai</CardContent></Card>
              )}
              {groupedGrades.map((group) => (
                <Card key={group.subjectName}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        {group.subjectName}
                      </CardTitle>
                      <Badge className={group.finalGrade >= 80 ? 'bg-emerald-50 text-emerald-700' : group.finalGrade >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}>
                        Final: {group.finalGrade}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow><TableHead>Jenis</TableHead><TableHead>Nama</TableHead><TableHead>Nilai</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.assignments.map((a, i) => (
                          <TableRow key={`a-${i}`}>
                            <TableCell><Badge variant="outline" className="bg-blue-50 text-blue-700">Tugas</Badge></TableCell>
                            <TableCell>{a.label}</TableCell>
                            <TableCell><span className={`font-bold ${a.value >= 80 ? 'text-emerald-600' : a.value >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{a.value}</span></TableCell>
                          </TableRow>
                        ))}
                        {group.exams.map((e, i) => (
                          <TableRow key={`e-${i}`}>
                            <TableCell><Badge variant="outline" className="bg-purple-50 text-purple-700">Ujian</Badge></TableCell>
                            <TableCell>{e.label}</TableCell>
                            <TableCell><span className={`font-bold ${e.value >= 80 ? 'text-emerald-600' : e.value >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{e.value}</span></TableCell>
                          </TableRow>
                        ))}
                        {group.assignments.length === 0 && group.exams.length === 0 && (
                          <TableRow><TableCell colSpan={3} className="text-center text-slate-500 py-2">Belum ada detail</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="attendance">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {selectedStudent.attendances.map((a, i) => (
                        <TableRow key={i}>
                          <TableCell>{new Date(a.date).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>
                            <Badge className={a.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : a.status === 'SICK' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}>
                              {a.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {selectedStudent.attendances.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-slate-500 py-4">Belum ada data</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exams">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Ujian</TableHead><TableHead>Mapel</TableHead><TableHead>Nilai</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {selectedStudent.submissions.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>{s.exam.title}</TableCell>
                          <TableCell>{s.exam.subject.name}</TableCell>
                          <TableCell>{s.totalScore !== null ? `${s.totalScore} (${Math.round(s.percentage || 0)}%)` : '-'}</TableCell>
                        </TableRow>
                      ))}
                      {selectedStudent.submissions.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-slate-500 py-4">Belum ada ujian</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bills">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Tagihan</TableHead><TableHead>Jumlah</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {selectedStudent.invoices.map((inv, i) => (
                        <TableRow key={i}>
                          <TableCell>{inv.title}</TableCell>
                          <TableCell>Rp {inv.amount.toLocaleString()}</TableCell>
                          <TableCell><Badge className={inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}>{inv.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                      {selectedStudent.invoices.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-slate-500 py-4">Tidak ada tagihan</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Wali Kelas - {homeroomClass.name}</h1>
          <p className="text-slate-500 mt-1">{homeroomClass.level.name} | {homeroomClass.students.length} siswa</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Daftar Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homeroomClass.students.map((student, i) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-slate-400">{i + 1}</TableCell>
                    <TableCell className="font-medium">{student.user.name}</TableCell>
                    <TableCell className="text-slate-500">{student.user.email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => viewStudent(student.id)}>
                        <Eye className="w-4 h-4 mr-1" /> Lihat Profil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
