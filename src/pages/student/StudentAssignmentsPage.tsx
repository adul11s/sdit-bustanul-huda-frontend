import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { Loader2, Clock, Pen, BookOpen, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

interface AssignmentSubmission {
  id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  content: string | null;
  score: number | null;
  submittedAt: string | null;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  content: string;
  dueDate: string;
  points: number;
  subject: { name: string; id: string; code: string | null };
  class: { name: string; id: string } | null;
  submission: AssignmentSubmission | null;
  isOverdue: boolean;
}

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', variant: 'secondary' as const, icon: Clock },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' as const, icon: Pen },
  SUBMITTED: { label: 'Submitted', variant: 'default' as const, icon: CheckCircle },
  GRADED: { label: 'Graded', variant: 'default' as const, icon: CheckCircle },
};

function getButtonLabel(status: string | undefined | null): string {
  if (!status || status === 'NOT_STARTED') return 'Start Assignment';
  if (status === 'IN_PROGRESS') return 'Continue';
  if (status === 'SUBMITTED') return 'View Submission';
  return 'View';
}

export default function StudentAssignmentsPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/assignments");
      const json = await res.json();
      if (json.success) {
        setAssignments(json.data || []);
      }
    } catch {
      toast.error("Failed to load assignments");
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

  const activeAssignments = assignments.filter(a => a.submission?.status !== 'GRADED');
  const completedAssignments = assignments.filter(a => a.submission?.status === 'GRADED');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/student')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">My Assignments</h1>
          <p className="text-muted-foreground">View and complete your assignments</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No assignments available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeAssignments.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Active Assignments ({activeAssignments.length})</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeAssignments.map((assignment) => {
                  const status = assignment.submission?.status ?? 'NOT_STARTED';
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG['NOT_STARTED'];
                  const Icon = config.icon;
                  const due = new Date(assignment.dueDate);
                  due.setHours(23, 59, 59, 999);
                  const isPastDue = due < new Date() && status === 'NOT_STARTED';

                  return (
                    <Card key={assignment.id} className={isPastDue ? 'border-red-200' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge variant={config.variant}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <CardDescription>{assignment.subject.name}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">{assignment.content}</p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                          <div>{assignment.points} points</div>
                        </div>

                        {isPastDue && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            Past due
                          </div>
                        )}

                        <Link to={`/student/assignments/${assignment.id}`}>
                          <Button className="w-full" variant={status === 'NOT_STARTED' ? 'default' : 'outline'}>
                            {getButtonLabel(status)}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {completedAssignments.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                Completed ({completedAssignments.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completedAssignments.map((assignment) => {
                  const score = assignment.submission?.score;
                  return (
                    <Card key={assignment.id} className="opacity-75">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Graded
                          </Badge>
                        </div>
                        <CardDescription>{assignment.subject.name}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center py-2">
                          {score != null ? (
                            <>
                              <p className="text-3xl font-bold text-emerald-600">{score}/{assignment.points}</p>
                              <p className="text-sm text-muted-foreground">
                                {Math.round((score / assignment.points) * 100)}%
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">Awaiting grade</p>
                          )}
                        </div>
                        <Link to={`/student/assignments/${assignment.id}`}>
                          <Button className="w-full" variant="outline">View Details</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}