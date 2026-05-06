import React,{ useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { toast } from "sonner";
import { Plus, Loader2, FileText, GraduationCap, Users } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";

interface Subject {
  id: string;
  name: string;
  code?: string;
  _count: { enrollments: number; assignments: number; exams: number };
}

interface Assignment {
  id: string;
  title: string;
  content: string;
  dueDate: string;
  points: number;
}

interface Exam {
  id: string;
  title: string;
  date: string;
  type: string;
  isPublished: boolean;
  _count: { questions: number };
}

interface Grade {
  id: string;
  value: number;
  student: { user: { name: string } };
  subject: { name: string };
  assignment?: { title: string };
  exam?: { title: string };
  createdAt: string;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/subjects");
      const data = await res.json();
      if (data.success) {
        setSubjects(data.data);
        if (data.data.length > 0) {
          setSelectedSubject(data.data[0].id);
        }
      }
    } catch (error) {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      loadSubjectData(selectedSubject);
    }
  }, [selectedSubject]);

  const loadSubjectData = async (subjectId: string) => {
    try {
      const [assignmentsRes, examsRes] = await Promise.all([
        fetch(`/api/teacher/assignments?subjectId=${subjectId}`),
        fetch(`/api/teacher/exams?subjectId=${subjectId}`),
      ]);
      const [assignmentsData, examsData] = await Promise.all([assignmentsRes.json(), examsRes.json()]);
      if (assignmentsData.success) setAssignments(assignmentsData.data);
      if (examsData.success) setExams(examsData.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
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
            <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your subjects, assignments, and exams</p>
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select subject">
                {subjects.find(s => s.id === selectedSubject)?.name || "Select subject"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Users className="h-4 w-4" />Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.find(s => s.id === selectedSubject)?._count?.enrollments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <FileText className="h-4 w-4" />Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.find(s => s.id === selectedSubject)?._count?.assignments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.find(s => s.id === selectedSubject)?._count?.exams || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Assignments</h2>
              <Button onClick={() => navigate('/teacher/assignments/create')}>
                <Plus className="mr-2 h-4 w-4" />Create Assignment
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.title}</TableCell>
                        <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{assignment.points}</TableCell>
                        <TableCell>
                          <Badge variant={new Date(assignment.dueDate) > new Date() ? "default" : "secondary"}>
                            {new Date(assignment.dueDate) > new Date() ? "Active" : "Closed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {assignments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-slate-500">No assignments</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Exams</h2>
              <Button onClick={() => navigate('/teacher/exams/create')}>
                <Plus className="mr-2 h-4 w-4" />Create Exam
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="outline">{exam.type}</Badge></TableCell>
                        <TableCell>{exam._count?.questions || 0}</TableCell>
                        <TableCell>
                          <Badge variant={exam.isPublished ? "default" : "secondary"}>
                            {exam.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {exams.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-slate-500">No exams</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.slice(0, 10).map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.student.user.name}</TableCell>
                        <TableCell>{grade.subject.name}</TableCell>
                        <TableCell>{grade.assignment ? "Assignment" : grade.exam ? "Exam" : "-"}</TableCell>
                        <TableCell><Badge>{grade.value}</Badge></TableCell>
                        <TableCell>{new Date(grade.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {grades.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-slate-500">No grades yet</TableCell>
                      </TableRow>
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