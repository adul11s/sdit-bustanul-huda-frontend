import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { useExam, useQuestionManager } from '../../hooks/use-exam';
import { IQuestion, QuestionType } from '../../interfaces/exam.types';
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  Save, 
  Trash2, 
  Edit, 
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Puzzle,
  Download
} from 'lucide-react';

interface QuestionFormData {
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  score: number;
}

const initialQuestionForm: QuestionFormData = {
  text: '',
  type: QuestionType.MCQ,
  options: ['', '', '', ''],
  correctAnswer: '',
  score: 10,
};

export function ExamDetailPage({ examId }: { examId: string }) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { exam, loading: examLoading, refetch } = useExam(examId);
  const { questions, loading: questionsLoading, createQuestion, deleteQuestion, uploadFromFile, refetch: refetchQuestions } = useQuestionManager(examId);
  
  const [questionForm, setQuestionForm] = useState<QuestionFormData>(initialQuestionForm);
  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'submissions'>('questions');

  const handleAddQuestion = async () => {
    await createQuestion({
      text: questionForm.text,
      type: questionForm.type,
      options: questionForm.type === QuestionType.MCQ ? questionForm.options : undefined,
      correctAnswer: questionForm.correctAnswer,
      score: questionForm.score,
    });
    setQuestionForm(initialQuestionForm);
    setShowQuestionForm(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await uploadFromFile(file);
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  const handlePublish = async () => {
    try {
      await fetch(`/api/exams/${examId}/publish`, { method: 'PATCH' });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (examLoading || questionsLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!exam) {
    return (
      <div className="container mx-auto py-6">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p>Exam not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/teacher/exams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {exam._count?.questions || 0} questions
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {exam._count?.submissions || 0} submissions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {exam.timeLimit} min
              </span>
              {exam.isPublished ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Published
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  Draft
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!exam.isPublished && (
            <Button onClick={handlePublish}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'questions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </Button>
        <Button
          variant={activeTab === 'submissions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions
        </Button>
      </div>

      {activeTab === 'questions' && (
        <>
          {/* Add Question Controls */}
          <div className="flex gap-2">
            <Button onClick={() => setShowQuestionForm(!showQuestionForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload from File
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Question Form */}
          {showQuestionForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text *</Label>
                  <Textarea
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                    placeholder="Enter your question"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Question Type *</Label>
                    <Select
                      value={questionForm.type}
                      onValueChange={(v) => setQuestionForm({ ...questionForm, type: v as QuestionType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                        <SelectItem value="ESSAY">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Score *</Label>
                    <Input
                      type="number"
                      value={questionForm.score}
                      onChange={(e) => setQuestionForm({ ...questionForm, score: parseInt(e.target.value) })}
                      min={1}
                    />
                  </div>
                </div>

                {questionForm.type === QuestionType.MCQ && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Option A</Label>
                        <Input
                          value={questionForm.options[0]}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[0] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder="Option A"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Option B</Label>
                        <Input
                          value={questionForm.options[1]}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[1] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder="Option B"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Option C</Label>
                        <Input
                          value={questionForm.options[2]}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[2] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder="Option C"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Option D</Label>
                        <Input
                          value={questionForm.options[3]}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[3] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder="Option D"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Correct Answer *</Label>
                      <Select
                        value={questionForm.correctAnswer}
                        onValueChange={(v) => setQuestionForm({ ...questionForm, correctAnswer: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleAddQuestion}>
                    <Save className="mr-2 h-4 w-4" />
                    {editingQuestion ? 'Update' : 'Save'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingQuestion(null);
                      setQuestionForm(initialQuestionForm);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Puzzle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No questions yet. Add questions to get started.</p>
                </CardContent>
              </Card>
            ) : (
              questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Q{index + 1}
                          </span>
                          <span className="text-sm px-2 py-0.5 rounded bg-muted">
                            {question.type}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {question.score} pts
                          </span>
                        </div>
                        <p className="font-medium">{question.text}</p>
                        {question.type === QuestionType.MCQ && question.options && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {question.options.map((option, i) => (
                              <div 
                                key={i} 
                                className={`text-sm ${
                                  ['A', 'B', 'C', 'D'][i] === question.correctAnswer 
                                    ? 'font-medium text-green-600' 
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {['A', 'B', 'C', 'D'][i]}. {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingQuestion(question);
                            setQuestionForm({
                              text: question.text,
                              type: question.type,
                              options: question.options || ['', '', '', ''],
                              correctAnswer: question.correctAnswer,
                              score: question.score,
                            });
                            setShowQuestionForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'submissions' && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>View student submissions from the submissions tab</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ExamDetailPage;