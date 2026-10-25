import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { Loader2, Clock, FileText, Pen, BookOpen, ArrowLeft } from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description?: string;
  type: string;
  subject: { name: string };
  timeLimit: number;
  totalScore: number;
  isPublished: boolean;
  _count?: { questions: number };
}

export default function StudentExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exam/student/exams");
      const json = await res.json();
      if (json.success) {
        setExams(json.data.data || []);
      }
    } catch {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/student')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">My Exams</h1>
          <p className="text-muted-foreground">View and take available exams</p>
        </div>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No exams available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  <Badge variant={exam.type === 'MCQ' ? 'default' : 'secondary'}>
                    {exam.type === 'MCQ' ? <Pen className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                    {exam.type}
                  </Badge>
                </div>
                <CardDescription>{exam.subject.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exam.description && (
                  <p className="text-sm text-muted-foreground">{exam.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {exam.timeLimit} min
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {exam._count?.questions || 0} questions
                  </div>
                  <div>{exam.totalScore} points</div>
                </div>

                <Link to={`/student/exams/${exam.id}`}>
                  <Button className="w-full">
                    {exam.type === 'MCQ' ? 'Take Quiz' : 'Write Essay'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}