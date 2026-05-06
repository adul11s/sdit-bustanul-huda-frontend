import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Save, TrendingUp, FileText, GraduationCap, ClipboardList, Eye, ChevronDown, ChevronUp, Users } from 'lucide-react';

interface StudentGrade {
  id: string;
  user: { name: string };
  grades: { value: number; createdAt: string }[];
  submission: AssignmentSubmission | ExamSubmission | null;
}

interface AssignmentSubmission {
  id: string;
  content: string | null;
  fileUrl: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  submittedAt: string | null;
  score: number | null;
  feedback: string | null;
}

interface ExamSubmission {
  id: string;
  status: string;
  totalScore: number | null;
  percentage: number | null;
  submittedAt: string | null;
  answers: Array<{
    id: string;
    answer: string;
    score: number | null;
    question: { text: string; type: string; correctAnswer: string };
  }>;
}

interface Subject {
  id: string;
  name: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface GradingTask {
  id: string;
  title: string;
  type: 'ASSIGNMENT' | 'EXAM';
  dueDate?: string;
  timeLimit?: number;
  points?: number;
  totalScore?: number;
}

interface TaskDetail {
  type: 'ASSIGNMENT' | 'EXAM';
  title: string;
  content?: string;
  points?: number;
  dueDate?: string;
  description?: string;
  totalScore?: number;
  timeLimit?: number;
  questions?: Array<{
    id: string;
    text: string;
    type: string;
    options?: any;
    correctAnswer: string;
    score: number;
    order: number;
  }>;
}

export default function TeacherGradePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tasks, setTasks] = useState<GradingTask[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTask, setSelectedTask] = useState<GradingTask | null>(null);
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [gradesMap, setGradesMap] = useState<Record<string, string>>({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    loadSubjectsAndClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadTasks();
    } else {
      setTasks([]);
      setSelectedTask(null);
    }
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTask) {
      loadStudents();
    } else {
      setStudents([]);
      setGradesMap({});
      setFeedbackMap({});
      setTaskDetail(null);
    }
  }, [selectedClass, selectedSubject, selectedTask]);

  const loadSubjectsAndClasses = async () => {
    try {
      const [subRes, clsRes] = await Promise.all([
        fetch('/api/teacher/subjects'),
        fetch('/api/teacher/classes'),
      ]);
      const [subJson, clsJson] = await Promise.all([subRes.json(), clsRes.json()]);
      if (subJson.success) setSubjects(subJson.data);
      if (clsJson.success) {
        const allClasses = clsJson.data.flatMap((l: any) => l.classes);
        setClasses(allClasses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await fetch(`/api/teacher/grading-tasks?classId=${selectedClass}&subjectId=${selectedSubject}`);
      const json = await res.json();
      if (json.success) {
        const allTasks: GradingTask[] = [
          ...json.data.assignments.map((a: any) => ({ ...a, type: 'ASSIGNMENT' as const })),
          ...json.data.exams.map((e: any) => ({ ...e, type: 'EXAM' as const })),
        ];
        setTasks(allTasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTasksLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!selectedTask) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/teacher/grading-detail?taskId=${selectedTask.id}&taskType=${selectedTask.type}&classId=${selectedClass}`
      );
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
        if (json.task) setTaskDetail(json.task);

        // Pre-fill with existing grades
        const gradeMap: Record<string, string> = {};
        const fbMap: Record<string, string> = {};
        json.data.forEach((s: StudentGrade) => {
          const existing = s.grades[0];
          if (existing) {
            gradeMap[s.id] = String(existing.value);
          }
          if (s.submission && 'feedback' in s.submission && s.submission.feedback) {
            fbMap[s.id] = s.submission.feedback;
          }
        });
        setGradesMap(gradeMap);
        setFeedbackMap(fbMap);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTask) {
      toast.error('Pilih tugas terlebih dahulu');
      return;
    }
    setSaving(true);
    try {
      for (const [studentId, value] of Object.entries(gradesMap)) {
        if (!value || isNaN(Number(value))) continue;
        const res = await fetch('/api/teacher/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            subjectId: selectedSubject,
            value: Number(value),
            assignmentId: selectedTask.type === 'ASSIGNMENT' ? selectedTask.id : undefined,
            examId: selectedTask.type === 'EXAM' ? selectedTask.id : undefined,
            comment: feedbackMap[studentId] || '',
          }),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error || `Gagal menyimpan nilai untuk siswa`);
        }
      }
      toast.success('Nilai berhasil disimpan');
      loadStudents();
    } catch (err) {
      toast.error('Gagal menyimpan nilai');
    } finally {
      setSaving(false);
    }
  };

  const getGradeColor = (value: number) => {
    if (value >= 85) return 'text-emerald-600';
    if (value >= 70) return 'text-amber-600';
    return 'text-red-500';
  };

  const getLetterGrade = (value: number) => {
    if (value >= 85) return 'A';
    if (value >= 70) return 'B';
    if (value >= 60) return 'C';
    return 'D';
  };

  const renderSubmissionPreview = (student: StudentGrade) => {
    const sub = student.submission;
    if (!sub) {
      return (
        <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-500">
          Belum ada pengumpulan
        </div>
      );
    }

    if (selectedTask?.type === 'ASSIGNMENT') {
      const assignmentSub = sub as AssignmentSubmission;
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={assignmentSub.status === 'GRADED' ? 'default' : assignmentSub.status === 'SUBMITTED' ? 'default' : 'secondary'}>
              {assignmentSub.status.replace('_', ' ')}
            </Badge>
            {assignmentSub.submittedAt && (
              <span className="text-slate-500">
                Dikumpulkan: {new Date(assignmentSub.submittedAt).toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {/* Two-column: Instructions vs Student Answer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Instruksi Tugas</p>
              <div className="prose prose-sm max-w-none p-4 bg-blue-50 border border-blue-100 rounded-lg">
                {taskDetail?.content ? (
                  <div dangerouslySetInnerHTML={{ __html: taskDetail.content }} />
                ) : (
                  <p className="text-slate-400 italic">Tidak ada instruksi</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Jawaban Siswa</p>
              {assignmentSub.content ? (
                <div
                  className="prose prose-sm max-w-none p-4 bg-emerald-50 border border-emerald-100 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: assignmentSub.content }}
                />
              ) : (
                <div className="p-4 bg-slate-50 border rounded-lg text-sm text-slate-400 italic">
                  Tidak ada jawaban tertulis
                </div>
              )}
              {assignmentSub.fileUrl && (
                <a href={assignmentSub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm hover:underline mt-2 inline-block">
                  Lihat Lampiran Siswa
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    // EXAM
    const examSub = sub as ExamSubmission;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={examSub.status === 'GRADED' ? 'default' : 'secondary'}>
            {examSub.status}
          </Badge>
          {examSub.submittedAt && (
            <span className="text-slate-500">
              Dikumpulkan: {new Date(examSub.submittedAt).toLocaleString('id-ID')}
            </span>
          )}
        </div>

        {/* Exam Q&A — show ALL questions with student's answer next to each */}
        <div className="space-y-4">
          {(taskDetail?.questions || examSub.answers?.map(a => a.question))?.map((q: any, idx: number) => {
            const ans = examSub.answers?.find((a: any) => a.questionId === q.id || a.question?.id === q.id);
            const isCorrect = ans && q.type === 'MCQ' && ans.answer === q.correctAnswer;
            const isWrong = ans && q.type === 'MCQ' && ans.answer !== q.correctAnswer;

            return (
              <div key={q.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4 border rounded-lg overflow-hidden">
                {/* Question */}
                <div className="p-4 bg-blue-50 border-r border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-200 px-2 py-0.5 rounded">
                      SOAL {idx + 1}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{q.type}</Badge>
                    <span className="text-xs text-slate-500">{q.score} poin</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{q.text}</p>
                  {q.type === 'MCQ' && q.options && (
                    <div className="mt-2 space-y-1">
                      {(typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt: string, i: number) => (
                        <div key={i} className={`text-sm px-2 py-1 rounded ${opt === q.correctAnswer ? 'bg-emerald-100 text-emerald-700 font-medium' : 'text-slate-600'}`}>
                          {String.fromCharCode(65 + i)}. {opt} {opt === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Student Answer */}
                <div className="p-4 bg-emerald-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded">
                      JAWABAN SISWA
                    </span>
                    {ans ? (
                      <>
                        {isCorrect && <Badge className="bg-emerald-500 text-[10px]">Benar</Badge>}
                        {isWrong && <Badge variant="destructive" className="text-[10px]">Salah</Badge>}
                        {ans.score !== null && <span className="text-xs text-slate-500">Skor: {ans.score}</span>}
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Tidak dijawab</Badge>
                    )}
                  </div>
                  {ans ? (
                    <p className={`text-sm font-medium ${isCorrect ? 'text-emerald-700' : isWrong ? 'text-red-600' : 'text-slate-800'}`}>
                      {ans.answer}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Siswa tidak menjawab soal ini</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Input Nilai</h1>
            <p className="text-slate-500 mt-1">Masukkan nilai untuk siswa berdasarkan tugas/ujian</p>
          </div>
        </div>

        {/* Selection Flow */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => { setSelectedClass(e.target.value); setSelectedTask(null); }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Mata Pelajaran</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => { setSelectedSubject(e.target.value); setSelectedTask(null); }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                  disabled={!selectedClass}
                >
                  <option value="">Pilih Mapel</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Tugas / Ujian</label>
                {tasksLoading ? (
                  <div className="flex items-center gap-2 py-2 text-slate-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
                  </div>
                ) : (
                  <select
                    value={selectedTask?.id || ''}
                    onChange={(e) => {
                      const task = tasks.find((t) => t.id === e.target.value);
                      setSelectedTask(task || null);
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                    disabled={!selectedSubject || tasks.length === 0}
                  >
                    <option value="">Pilih Tugas/Ujian</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.type === 'ASSIGNMENT' ? 'Tugas' : 'Ujian'}: {t.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task info */}
        {selectedTask && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="py-3 flex items-center gap-3">
              {selectedTask.type === 'ASSIGNMENT' ? (
                <FileText className="h-5 w-5 text-emerald-600" />
              ) : (
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              )}
              <div>
                <p className="font-medium text-emerald-800">{selectedTask.title}</p>
                <p className="text-xs text-emerald-600">
                  {selectedTask.type === 'ASSIGNMENT'
                    ? `Tugas | Batas: ${selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('id-ID') : '-'} | ${selectedTask.points} poin`
                    : `Ujian | Durasi: ${selectedTask.timeLimit} menit | Total: ${selectedTask.totalScore} poin`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : selectedTask ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              {students.length} siswa ditargetkan untuk {selectedTask.type === 'ASSIGNMENT' ? 'tugas' : 'ujian'} ini
            </div>

            {students.map((student) => {
              const isExpanded = expandedStudent === student.id;
              const hasSubmission = !!student.submission;
              const isGraded = student.grades.length > 0;

              return (
                <Card key={student.id} className={isGraded ? 'border-emerald-200' : ''}>
                  <CardContent className="p-4">
                    {/* Student header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600">
                          {student.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{student.user.name}</p>
                          <div className="flex items-center gap-2 text-xs">
                            {hasSubmission ? (
                              <Badge variant="default" className="text-[10px]">
                                {selectedTask.type === 'ASSIGNMENT'
                                  ? (student.submission as AssignmentSubmission)?.status.replace('_', ' ')
                                  : (student.submission as ExamSubmission)?.status}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">Belum mengumpulkan</Badge>
                            )}
                            {isGraded && (
                              <span className={`font-bold ${getGradeColor(student.grades[0].value)}`}>
                                Nilai: {student.grades[0].value}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={selectedTask.type === 'ASSIGNMENT' ? (selectedTask.points || 100) : (selectedTask.totalScore || 100)}
                          value={gradesMap[student.id] || ''}
                          onChange={(e) => setGradesMap(prev => ({ ...prev, [student.id]: e.target.value }))}
                          placeholder="0"
                          className="w-20 text-center"
                        />
                        {gradesMap[student.id] && (
                          <Badge className={`${getGradeColor(Number(gradesMap[student.id]))} bg-slate-50`}>
                            {getLetterGrade(Number(gradesMap[student.id]))}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded submission preview */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-slate-700 mb-2">Pengumpulan Siswa</p>
                        {renderSubmissionPreview(student)}

                        {hasSubmission && (
                          <div className="mt-3">
                            <label className="text-sm font-medium text-slate-700">Feedback / Catatan</label>
                            <textarea
                              value={feedbackMap[student.id] || ''}
                              onChange={(e) => setFeedbackMap(prev => ({ ...prev, [student.id]: e.target.value }))}
                              placeholder="Berikan feedback untuk siswa..."
                              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm min-h-[80px]"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {students.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  Tidak ada siswa yang ditargetkan untuk tugas/ujian ini
                </CardContent>
              </Card>
            )}
          </div>
        ) : selectedClass && selectedSubject && !selectedTask ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              {tasks.length === 0 ? 'Belum ada tugas atau ujian untuk kelas dan mapel ini' : 'Pilih tugas atau ujian untuk mulai mengisi nilai'}
            </CardContent>
          </Card>
        ) : null}

        {selectedTask && students.length > 0 && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Nilai
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
}
