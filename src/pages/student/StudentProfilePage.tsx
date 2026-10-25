import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Loader2, User, BookOpen, Calendar, TrendingUp, CreditCard, GraduationCap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StudentProfileData {
  user: { name: string; email: string; gender: string };
  class: { name: string; level: { name: string }; homeroomTeacher: { user: { name: string } } };
  enrollments: { subject: { name: string; teacher: { user: { name: string } } } }[];
  grades: { value: number; subject: { name: string }; assignment?: { title: string }; exam?: { title: string }; createdAt: string }[];
  attendances: { date: string; status: string; note?: string }[];
  invoices: { title: string; amount: number; status: string; dueDate: string }[];
  submissions: { exam: { title: string; subject: { name: string } }; status: string; totalScore?: number; percentage?: number }[];
}

export default function StudentProfilePage() {
  const [data, setData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/student/profile');
      const json = await res.json();
      if (json.success) setData(json.data);
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

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-600">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  const attendances = data.attendances || [];
  const grades = data.grades || [];
  const enrollments = data.enrollments || [];
  const submissions = data.submissions || [];
  const invoices = data.invoices || [];

  const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendances.filter(a => a.status === 'ABSENT').length;
  const sickCount = attendances.filter(a => a.status === 'SICK').length;
  const avgGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.value, 0) / grades.length).toFixed(1)
    : '0';

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT': return <Badge className="bg-emerald-50 text-emerald-700">Present</Badge>;
      case 'ABSENT': return <Badge className="bg-red-50 text-red-700">Absent</Badge>;
      case 'SICK': return <Badge className="bg-amber-50 text-amber-700">Sick</Badge>;
      case 'LATE': return <Badge className="bg-blue-50 text-blue-700">Late</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{data.user.name}</h1>
            <p className="text-slate-500">{data.class.level.name} - {data.class.name}</p>
            <p className="text-sm text-slate-400">Wali Kelas: {data.class.homeroomTeacher.user.name}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Average Grade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{avgGrade}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{presentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{absentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Sick
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{sickCount}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="grades">
          <TabsList>
            <TabsTrigger value="grades"><TrendingUp className="w-4 h-4 mr-1" /> Grades</TabsTrigger>
            <TabsTrigger value="subjects"><BookOpen className="w-4 h-4 mr-1" /> Subjects</TabsTrigger>
            <TabsTrigger value="attendance"><Calendar className="w-4 h-4 mr-1" /> Attendance</TabsTrigger>
            <TabsTrigger value="exams"><GraduationCap className="w-4 h-4 mr-1" /> Exams</TabsTrigger>
            <TabsTrigger value="bills"><CreditCard className="w-4 h-4 mr-1" /> Bills</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grade History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((g) => (
                      <TableRow key={g.createdAt}>
                        <TableCell>{g.subject.name}</TableCell>
                        <TableCell>{g.assignment?.title || g.exam?.title || 'General'}</TableCell>
                        <TableCell>
                          <Badge className={g.value >= 80 ? 'bg-emerald-50 text-emerald-700' : g.value >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}>
                            {g.value}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(g.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {grades.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">No grades yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects">
            <div className="grid gap-4 md:grid-cols-3">
              {enrollments.map((e) => (
                <Card key={e.subject.name}>
                  <CardHeader>
                    <CardTitle className="text-base">{e.subject.name}</CardTitle>
                    <CardDescription>{e.subject.teacher.user.name}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History (Last 30 days)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.map((a) => (
                      <TableRow key={a.date}>
                        <TableCell>{new Date(a.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</TableCell>
                        <TableCell>{statusBadge(a.status)}</TableCell>
                        <TableCell className="text-slate-500">{a.note || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {attendances.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-slate-500 py-4">No attendance records</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Exam Results</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => (
                      <TableRow key={s.exam.title}>
                        <TableCell>{s.exam.title}</TableCell>
                        <TableCell>{s.exam.subject.name}</TableCell>
                        <TableCell>
                          <Badge className={s.status === 'GRADED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {s.totalScore !== null ? (
                            <span className={`font-bold ${(s.percentage || 0) >= 60 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {s.totalScore} ({Math.round(s.percentage || 0)}%)
                            </span>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {submissions.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">No exams taken</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.title}>
                        <TableCell>{inv.title}</TableCell>
                        <TableCell>Rp {inv.amount.toLocaleString('id-ID')}</TableCell>
                        <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}>
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoices.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">No invoices</TableCell></TableRow>
                    )}
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
