import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save, FileText, Users, Calendar, Hash } from 'lucide-react';

interface ClassOption {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

export default function TeacherAssignmentCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);

  const [form, setForm] = useState({
    title: '',
    content: '',
    dueDate: '',
    points: 100,
    subjectId: '',
    targetType: 'CLASS' as 'CLASS' | 'STUDENT',
    classId: '',
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subRes, clsRes, stuRes] = await Promise.all([
          fetch('/api/teacher/subjects'),
          fetch('/api/teacher/classes'),
          fetch('/api/teacher/students'),
        ]);
        const [subJson, clsJson, stuJson] = await Promise.all([subRes.json(), clsRes.json(), stuRes.json()]);

        if (subJson.success) {
          const subs = subJson.data.map((s: any) => ({ id: s.id, name: s.name }));
          setSubjects(subs);
          if (subs.length > 0) {
            setForm((prev) => ({ ...prev, subjectId: subs[0].id }));
          }
        }
        if (clsJson.success) {
          const allClasses = clsJson.data.flatMap((l: any) => l.classes);
          setClasses(allClasses);
          if (allClasses.length > 0) {
            setForm((prev) => ({ ...prev, classId: allClasses[0].id }));
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
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Assignment title is required');
      return;
    }
    if (!form.content.trim()) {
      toast.error('Assignment content is required');
      return;
    }
    if (!form.dueDate) {
      toast.error('Due date is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          dueDate: new Date(form.dueDate).toISOString(),
          points: form.points,
          subjectId: form.subjectId,
          targetType: form.targetType,
          classId: form.targetType === 'CLASS' ? form.classId : undefined,
          studentIds: form.targetType === 'STUDENT' ? selectedStudents : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Assignment created successfully');
        navigate('/teacher');
      } else {
        toast.error(data.error || 'Failed to create assignment');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/teacher')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Assignment</h1>
            <p className="text-slate-500">Give your students a task with clear instructions</p>
          </div>
        </div>

        {/* Assignment Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Assignment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Tugas Matematika - Bab Pecahan"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Subject</Label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Points</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    value={form.points}
                    onChange={(e) => setForm((prev) => ({ ...prev, points: Number(e.target.value) }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Instructions / Content</Label>
              <textarea
                className="w-full min-h-[160px] px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Describe the assignment, include any materials needed, and explain what students should submit..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Targeting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Target Students
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={form.targetType === 'CLASS'}
                  onChange={() => setForm((prev) => ({ ...prev, targetType: 'CLASS' }))}
                  className="accent-emerald-600"
                />
                <span className="text-sm font-medium text-slate-700">Entire Class</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={form.targetType === 'STUDENT'}
                  onChange={() => setForm((prev) => ({ ...prev, targetType: 'STUDENT' }))}
                  className="accent-emerald-600"
                />
                <span className="text-sm font-medium text-slate-700">Specific Students</span>
              </label>
            </div>

            {form.targetType === 'CLASS' && (
              <div>
                <Label className="text-slate-500 text-xs mb-1 block">Select Class</Label>
                <select
                  value={form.classId}
                  onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {form.targetType === 'STUDENT' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {students.map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedStudents.includes(s.id)
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-100 hover:border-emerald-200'
                    }`}
                  >
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
                      className="accent-emerald-600"
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/teacher')}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 px-8"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Create Assignment
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
