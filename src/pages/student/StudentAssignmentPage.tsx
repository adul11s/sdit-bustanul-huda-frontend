import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Clock, ArrowLeft, Save, Send, CheckCircle } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

interface Assignment {
  id: string;
  title: string;
  content: string;
  dueDate: string;
  points: number;
  subject: { name: string; id: string; code: string | null };
  submission: {
    id: string;
    content: string | null;
    fileUrl: string | null;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
    score: number | null;
    feedback: string | null;
    submittedAt: string | null;
    createdAt: string;
  } | null;
}

export default function StudentAssignmentPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Write your answer here...' }),
      Link.configure({ openOnClick: false }),
    ],
    content: assignment?.submission?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/assignments/${assignmentId}`);
      const json = await res.json();
      if (json.success) {
        setAssignment(json.data);
        if (json.data.submission?.content && editor) {
          editor.commands.setContent(json.data.submission.content);
        }
      }
    } catch {
      toast.error("Failed to load assignment");
      navigate('/student/assignments');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = useCallback(async () => {
    if (!assignment || !editor) return;
    const content = editor.getHTML();
    if (content === '<p></p>') return;

    try {
      await fetch(`/api/student/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [assignment, editor, assignmentId]);

  useEffect(() => {
    if (!assignment) return;
    const interval = setInterval(autoSave, 15000);
    return () => clearInterval(interval);
  }, [autoSave]);

  const handleSave = async () => {
    if (!assignment || !editor) return;
    setSaving(true);
    try {
      const content = editor.getHTML();
      await fetch(`/api/student/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setLastSaved(new Date());
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignment || !editor) return;
    if (!confirm('Are you sure you want to submit? You cannot change your answer after submission.')) return;

    setSubmitting(true);
    try {
      const content = editor.getHTML();
      const res = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Assignment submitted successfully');
        navigate('/student/assignments');
      } else {
        toast.error(json.error || 'Failed to submit');
      }
    } catch {
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Assignment not found</p>
            <Button onClick={() => navigate('/student/assignments')} className="mt-4">Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = assignment.submission?.status || 'NOT_STARTED';
  const isSubmitted = status === 'SUBMITTED' || status === 'GRADED';
  const due = new Date(assignment.dueDate);
  due.setHours(23, 59, 59, 999);
  const isOverdue = due < new Date() && !isSubmitted;

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/assignments')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              <Badge variant={isSubmitted ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                {isSubmitted ? (status === 'GRADED' ? 'Graded' : 'Submitted') :
                 isOverdue ? 'Overdue' : status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">{assignment.subject.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: assignment.content }} />
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">{assignment.points} points</span>
          </div>
        </CardContent>
      </Card>

      {/* Graded result */}
      {status === 'GRADED' && assignment.submission && assignment.submission.score !== null && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-emerald-800">Assignment Graded</p>
                {assignment.submission.feedback && (
                  <p className="text-sm text-emerald-700 mt-1">{assignment.submission.feedback}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">
                  {assignment.submission.score}/{assignment.points}
                </p>
                <p className="text-sm text-emerald-600">
                  {Math.round((assignment.submission.score / assignment.points) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted but not graded */}
      {status === 'SUBMITTED' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">Assignment Submitted</p>
                <p className="text-sm text-blue-600">
                  Submitted on {assignment.submission?.submittedAt ? new Date(assignment.submission.submittedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Answer editor (only if not submitted) */}
      {!isSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-50 border-b p-2 flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={editor?.isActive('bold') ? 'bg-slate-200' : ''}
                >
                  <span className="font-bold">B</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={editor?.isActive('italic') ? 'bg-slate-200' : ''}
                >
                  <span className="italic">I</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={editor?.isActive('underline') ? 'bg-slate-200' : ''}
                >
                  <span className="underline">U</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={editor?.isActive('bulletList') ? 'bg-slate-200' : ''}
                >
                  • List
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={editor?.isActive('orderedList') ? 'bg-slate-200' : ''}
                >
                  1. List
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().setParagraph().run()}
                >
                  P
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={editor?.isActive('heading', { level: 3 }) ? 'bg-slate-200' : ''}
                >
                  H3
                </Button>
              </div>
              <EditorContent editor={editor} />
            </div>

            {isOverdue && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                The due date has passed. You can still submit but may incur a penalty.
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}