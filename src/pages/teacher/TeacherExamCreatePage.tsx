import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Upload, Download, ArrowLeft, Save } from 'lucide-react';

interface QuestionForm {
  id: string;
  text: string;
  type: 'MCQ' | 'ESSAY';
  options: string[];
  correctAnswer: string;
  score: number;
}

interface ExamForm {
  title: string;
  description: string;
  type: 'MCQ' | 'ESSAY' | 'MIXED';
  timeLimit: number;
  totalScore: number;
  targetType: 'CLASS' | 'STUDENT';
  classId: string;
  category: 'WEEKLY_EXAM' | 'MIDTERM' | 'FINAL';
}

interface ClassOption {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  name: string;
}

export default function TeacherExamCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<ExamForm>({
    title: '',
    description: '',
    type: 'MCQ',
    timeLimit: 60,
    totalScore: 100,
    targetType: 'CLASS',
    classId: '',
    category: 'WEEKLY_EXAM',
  });
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [filePreview, setFilePreview] = useState<QuestionForm[] | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addQuestion = (type: 'MCQ' | 'ESSAY') => {
    const newQ: QuestionForm = {
      id: generateId(),
      text: '',
      type,
      options: type === 'MCQ' ? ['', '', '', ''] : [],
      correctAnswer: '',
      score: 10,
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const updateQuestion = (id: string, updates: Partial<QuestionForm>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Load classes and students for targeting
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clsRes, stuRes] = await Promise.all([
          fetch('/api/teacher/classes'),
          fetch('/api/teacher/students'),
        ]);
        const [clsJson, stuJson] = await Promise.all([clsRes.json(), stuRes.json()]);
        if (clsJson.success) {
          const allClasses = clsJson.data.flatMap((l: any) => l.classes);
          setClasses(allClasses);
          if (allClasses.length > 0) {
            setExam((prev) => ({ ...prev, classId: allClasses[0].id }));
          }
        }
        if (stuJson.success) {
          setStudents(stuJson.data.map((s: any) => ({ id: s.id, name: s.user.name })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  });

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilePreview(null);
    setFileErrors([]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', 'preview');

    try {
      const res = await fetch('/api/exam/exams/preview-questions', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data.questions) {
        const parsed = json.data.questions.map((q: any) => ({
          id: generateId(),
          text: q.text,
          type: q.type,
          options: q.options || [],
          correctAnswer: q.correctAnswer || '',
          score: q.score,
        }));
        setFilePreview(parsed);
        if (json.data.errors?.length > 0) {
          setFileErrors(json.data.errors);
        }
      } else {
        setFileErrors(json.errors || ['Failed to parse file']);
      }
    } catch {
      toast.error('Failed to upload file');
    }
  };

  const applyFilePreview = () => {
    if (filePreview) {
      setQuestions(filePreview);
      setFilePreview(null);
      toast.success(`${filePreview.length} questions imported`);
    }
  };

  const handleSubmit = async () => {
    if (!exam.title) {
      toast.error('Exam title is required');
      return;
    }
    if (questions.length === 0) {
      toast.error('At least one question is required');
      return;
    }

    // Validate questions
    for (const q of questions) {
      if (!q.text.trim()) {
        toast.error('All questions must have text');
        return;
      }
      if (q.type === 'MCQ') {
        if (q.options.some((o) => !o.trim())) {
          toast.error('MCQ questions must have all 4 options');
          return;
        }
        if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer.toUpperCase())) {
          toast.error('MCQ questions must have a valid correct answer (A, B, C, or D)');
          return;
        }
      }
    }

    setLoading(true);
    try {
      // Create exam with targeting
      const examRes = await fetch('/api/exam/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: exam.title,
          description: exam.description,
          type: exam.type,
          timeLimit: exam.timeLimit,
          totalScore: exam.totalScore,
          subjectId: '', // Will be set by backend from teacher's subject
          targetType: exam.targetType,
          classId: exam.targetType === 'CLASS' ? exam.classId : undefined,
          studentIds: exam.targetType === 'STUDENT' ? selectedStudents : undefined,
          category: exam.category,
        }),
      });
      const examData = await examRes.json();

      if (!examData.success) {
        throw new Error(examData.error || 'Failed to create exam');
      }

      // Create questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await fetch('/api/exam/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examId: examData.data.id,
            text: q.text,
            type: q.type,
            options: q.type === 'MCQ' ? q.options : undefined,
            correctAnswer: q.type === 'MCQ' ? q.correctAnswer.toUpperCase() : '',
            score: q.score,
            order: i + 1,
          }),
        });
      }

      toast.success('Exam and questions created successfully');
      navigate('/teacher');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/teacher')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Exam</h1>
            <p className="text-slate-500">Build your exam with mixed question types</p>
          </div>
        </div>

        {/* Exam Config */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input
                  value={exam.title}
                  onChange={(e) => setExam((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., UTS Matematika Semester 1"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Type</label>
                <select
                  value={exam.type}
                  onChange={(e) => setExam((prev) => ({ ...prev, type: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="MCQ">Multiple Choice Only</option>
                  <option value="ESSAY">Essay Only</option>
                  <option value="MIXED">Mixed (MCQ + Essay)</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Time Limit (minutes)</label>
                <Input
                  type="number"
                  value={exam.timeLimit}
                  onChange={(e) => setExam((prev) => ({ ...prev, timeLimit: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Total Score Target</label>
                <Input
                  type="number"
                  value={exam.totalScore}
                  onChange={(e) => setExam((prev) => ({ ...prev, totalScore: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Grade Category</label>
                <select
                  value={exam.category}
                  onChange={(e) => setExam((prev) => ({ ...prev, category: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="WEEKLY_EXAM">Weekly Exam (20%)</option>
                  <option value="MIDTERM">Midterm (30%)</option>
                  <option value="FINAL">Final Exam (30%)</option>
                </select>
              </div>
            </div>

            {/* Targeting */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-sm font-medium text-slate-700">Target</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    checked={exam.targetType === 'CLASS'}
                    onChange={() => setExam((prev) => ({ ...prev, targetType: 'CLASS' }))}
                  />
                  <span className="text-sm">Entire Class</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="targetType"
                    checked={exam.targetType === 'STUDENT'}
                    onChange={() => setExam((prev) => ({ ...prev, targetType: 'STUDENT' }))}
                  />
                  <span className="text-sm">Specific Students</span>
                </label>
              </div>

              {exam.targetType === 'CLASS' && (
                <div className="mt-3">
                  <select
                    value={exam.classId}
                    onChange={(e) => setExam((prev) => ({ ...prev, classId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {exam.targetType === 'STUDENT' && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {students.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents((prev) => [...prev, s.id]);
                          } else {
                            setSelectedStudents((prev) => prev.filter((id) => id !== s.id));
                          }
                        }}
                      />
                      <span className="text-sm">{s.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Bulk Import (CSV)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <a
                href="/api/exam/questions/template"
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Template
              </a>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload CSV
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {fileErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm space-y-1">
                <p className="font-semibold">Errors found:</p>
                {fileErrors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}

            {filePreview && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Preview: {filePreview.length} questions found</p>
                <Button onClick={applyFilePreview} variant="outline" size="sm">
                  Apply to Exam
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Questions ({questions.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addQuestion('MCQ')}>
                <Plus className="w-4 h-4 mr-1" /> MCQ
              </Button>
              <Button variant="outline" size="sm" onClick={() => addQuestion('ESSAY')}>
                <Plus className="w-4 h-4 mr-1" /> Essay
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={q.type === 'MCQ' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}>
                      {q.type}
                    </Badge>
                    <span className="text-sm text-slate-400">Question {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={q.score}
                      onChange={(e) => updateQuestion(q.id, { score: Number(e.target.value) })}
                      className="w-20 text-center"
                      placeholder="Score"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Input
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                  placeholder="Enter question text..."
                />

                {q.type === 'MCQ' && (
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[i] = e.target.value;
                            updateQuestion(q.id, { options: newOptions });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        />
                      </div>
                    ))}
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-sm text-slate-500">Correct Answer:</span>
                      {['A', 'B', 'C', 'D'].map((letter) => (
                        <button
                          key={letter}
                          onClick={() => updateQuestion(q.id, { correctAnswer: letter })}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                            q.correctAnswer === letter
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>No questions yet. Add MCQ or Essay questions above.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Create Exam
        </Button>
      </div>
    </DashboardLayout>
  );
}
