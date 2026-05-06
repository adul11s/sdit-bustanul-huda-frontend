import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { toast } from "sonner";
import { Loader2, BookOpen, Calendar, FileText, GraduationCap, DollarSign, Bell, TrendingUp } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";

interface StudentProfile {
  id: string;
  user: { name: string; email: string };
  class?: {
    name: string; level: { name: string }; homeroomTeacher?: { user: { name: string } };
    enrollments: Array<{ subject: { id: string; name: string; teacher: { user: { name: string } } } }>;
  };
  enrollments?: Array<{ subject: { id: string; name: string; teacher: { user: { name: string } } } }>;
}

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: { name: string };
  room?: string;
}

interface Assignment {
  id: string;
  title: string;
  content: string;
  dueDate: string;
  subject: { name: string };
  grades: Array<{ value: number }>;
  submission?: {
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
    score: number | null;
  } | null;
}

interface Exam {
  id: string;
  title: string;
  date: string;
  type: string;
  subject: { name: string };
  grades: Array<{ value: number }>;
  createdAt: string;
  submissions?: Array<{ status: string; totalScore?: number }>;
}

interface Grade {
  id: string;
  value: number;
  subject: { name: string };
  assignment?: { title: string };
  exam?: { title: string };
  createdAt: string;
}

interface Invoice {
  id: string;
  title: string;
  amount: number;
  status: string;
  dueDate: string;
}

interface Bulletin {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  createdAt: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [billing, setBilling] = useState<{ totalBilled: number; totalPaid: number; totalOutstanding: number }>({ totalBilled: 0, totalPaid: 0, totalOutstanding: 0 });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes] = await Promise.all([
        fetch("/api/student/profile"),
      ]);
      const profileData = await profileRes.json();
      if (profileData.success) setProfile(profileData.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadStudentData();
    }
  }, [profile]);

  const loadStudentData = async () => {
    try {
      const [scheduleRes, assignmentsRes, examsRes, gradesRes, billingRes, bulletinsRes, rankingRes] = await Promise.all([
        fetch("/api/student/schedule"),
        fetch("/api/student/assignments"),
        fetch("/api/student/exams"),
        fetch("/api/student/grades"),
        fetch("/api/student/billing"),
        fetch("/api/student/bulletins"),
        fetch("/api/student/ranking"),
      ]);
      const [scheduleData, assignmentsData, examsData, gradesData, billingData, bulletinsData, rankingData] = await Promise.all([
        scheduleRes.json(), assignmentsRes.json(), examsRes.json(), gradesRes.json(), billingRes.json(), bulletinsRes.json(), rankingRes.json()
      ]);
      if (scheduleData.success) setSchedule(scheduleData.data);
      if (assignmentsData.success) setAssignments(assignmentsData.data);
      if (examsData.success) setExams(examsData.data);
      if (gradesData.success) setGrades(gradesData.data);
      if (billingData.success) { setBilling(billingData.data); setInvoices(billingData.data.invoices || []); }
      if (bulletinsData.success) setBulletins(bulletinsData.data);
      if (rankingData.success) setMyRank(rankingData.data.myRank);
    } catch (error) {
      toast.error("Failed to load student data");
    }
  };

  const getAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, g) => sum + g.value, 0);
    return Math.round((total / grades.length) * 100) / 100;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {profile?.user?.name}</h1>
            <p className="text-slate-500 mt-1">
              {profile?.class?.level?.name} - {profile?.class?.name}
              {profile?.class?.homeroomTeacher && <span> | Homeroom: {profile.class.homeroomTeacher.user.name}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">Rank: #{myRank}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Average Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAverage()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.enrollments?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Billed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${billing.totalBilled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${billing.totalOutstanding}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <Card>
              <CardHeader><CardTitle>Weekly Schedule</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>{DAYS[s.dayOfWeek]}</TableCell>
                        <TableCell>{s.startTime} - {s.endTime}</TableCell>
                        <TableCell className="font-medium">{s.subject.name}</TableCell>
                        <TableCell>{s.room || "-"}</TableCell>
                      </TableRow>
                    ))}
                    {schedule.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center py-4">No schedule</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader><CardTitle>Assignments</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.subject.name}</TableCell>
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {(() => {
                            const sub = a.submission;
                            if (sub?.status === 'GRADED' && sub.score !== null) {
                              return <Badge className="bg-green-500">Graded: {sub.score}</Badge>;
                            }
                            if (sub?.status === 'SUBMITTED') {
                              return <Badge variant="default">Submitted</Badge>;
                            }
                            if (sub?.status === 'IN_PROGRESS') {
                              return <Badge variant="default">In Progress</Badge>;
                            }
                            const due = new Date(a.dueDate);
                            due.setHours(23, 59, 59, 999);
                            const isPastDue = due < new Date();
                            return <Badge variant={isPastDue ? "secondary" : "default"}>
                              {isPastDue ? "Overdue" : "Pending"}
                            </Badge>;
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {assignments.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center py-4">No assignments</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card>
              <CardHeader><CardTitle>Exams</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((e) => {
                      const submission = e.submissions?.[0];
                      return (
                        <TableRow key={e.id}>
                          <TableCell>{e.subject.name}</TableCell>
                          <TableCell className="font-medium">{e.title}</TableCell>
                          <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell><Badge variant="outline">{e.type}</Badge></TableCell>
                          <TableCell>
                            {submission?.status === 'SUBMITTED' || submission?.status === 'GRADED' ? (
                              <Badge className="bg-green-500">Score: {submission.totalScore || 0}</Badge>
                            ) : (
                              <Badge variant="default">Available</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission?.status === 'SUBMITTED' || submission?.status === 'GRADED' ? (
                              <Link to={`/student/exams/${e.id}`}>
                                <Button size="sm">View</Button>
                              </Link>
                            ) : (
                              <Link to={`/student/exams/${e.id}`}>
                                <Button size="sm">Take</Button>
                              </Link>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {exams.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-4">No exams</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardHeader><CardTitle>Grades</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell>{g.subject.name}</TableCell>
                        <TableCell>{g.assignment ? "Assignment" : g.exam ? "Exam" : "-"}</TableCell>
                        <TableCell className="font-medium">{g.assignment?.title || g.exam?.title || "-"}</TableCell>
                        <TableCell><Badge className="bg-green-500">{g.value}</Badge></TableCell>
                        <TableCell>{new Date(g.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {grades.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-4">No grades yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader><CardTitle>Billing & Payments</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.title}</TableCell>
                        <TableCell>${inv.amount}</TableCell>
                        <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === "PAID" ? "default" : "destructive"}>
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoices.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center py-4">No bills</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulletins">
            <Card>
              <CardHeader><CardTitle>Bulletins & Announcements</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {bulletins.map((b) => (
                  <div key={b.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{b.title}</h3>
                      <Badge variant="outline">{b.category}</Badge>
                    </div>
                    <p className="text-slate-600 text-sm">{b.content}</p>
                    <p className="text-slate-400 text-xs mt-2">{new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                {bulletins.length === 0 && (
                  <p className="text-center py-4 text-slate-500">No bulletins</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}