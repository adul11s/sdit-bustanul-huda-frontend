import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStudentExam } from '../../hooks/use-exam';
import { QuestionType, SubmissionStatus } from '../../interfaces/exam.types';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Textarea } from '../../../components/ui/textarea';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Send,
  Save,
  Timer,
  AlertTriangle
} from 'lucide-react';

export function StudentExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const examIdParam = examId || '';

  const {
    submission,
    loading,
    error,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    currentQuestion,
    answeredCount,
    totalQuestions,
    progress,
    startExam,
    submitAnswer,
    submitExam,
    autoSubmit,
  } = useStudentExam(examIdParam);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [examStarted, setExamStarted] = useState(false);

  const handleStartExam = async () => {
    try {
      const result = await startExam();
      setExamStarted(true);
      setRemainingTime((result?.exam?.timeLimit || 60) * 60);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if (submission) {
      setIsSubmitting(true);
      try {
        await autoSubmit();
        navigate('/student/exams');
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [submission, autoSubmit, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examStarted, remainingTime, handleAutoSubmit]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSaveAnswer = async (questionId: string, answerValue?: string) => {
    const answer = answerValue || answers[questionId];
    if (!answer) return;

    try {
      await submitAnswer(questionId, answer);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = async () => {
    const currentQ = submission?.answers?.[currentQuestionIndex];
    if (currentQ?.question?.type === 'ESSAY' && answers[currentQ.questionId]) {
      await handleSaveAnswer(currentQ.questionId);
    }
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleSubmitExam = async () => {
    if (!confirm('Are you sure you want to submit? This cannot be undone.')) return;
    
    setIsSubmitting(true);
    try {
      await submitExam();
      navigate('/student/exams');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="font-medium mb-2">Unable to Load Exam</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/student/exams')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

// If no submission exists, show start page
  if (!submission) {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Button variant="ghost" onClick={() => navigate('/student/exams')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Start Exam</CardTitle>
            <CardDescription>Click start to begin your exam</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStartExam} className="w-full" size="lg">
              <CheckCircle className="mr-2 h-5 w-5" />
              Start Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examStarted && submission?.status === 'DRAFT') {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Button variant="ghost" onClick={() => navigate('/student/exams')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{submission?.exam?.title || 'Exam'}</CardTitle>
            <CardDescription>Ready to begin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {submission?.exam?.timeLimit} minutes
              </div>
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {totalQuestions} questions
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Instructions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• The timer will start once you begin</li>
                <li>• You cannot pause the timer once started</li>
                <li>• Make sure to submit before time runs out</li>
                <li>• Your answers will be auto-saved</li>
              </ul>
            </div>

            <Button onClick={handleStartExam} className="w-full" size="lg">
              <CheckCircle className="mr-2 h-5 w-5" />
              Start Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examStarted && submission?.status === 'DRAFT') {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{submission?.exam?.title || 'Exam'}</CardTitle>
            <CardDescription>Ready to begin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {submission?.exam?.timeLimit} minutes
              </div>
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {totalQuestions} questions
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Instructions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• The timer will start once you begin</li>
                <li>• You cannot pause the timer once started</li>
                <li>• Make sure to submit before time runs out</li>
                <li>• Your answers will be auto-saved</li>
              </ul>
            </div>

            <Button onClick={handleStartExam} className="w-full" size="lg">
              <CheckCircle className="mr-2 h-5 w-5" />
              Start Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submission?.status === 'SUBMITTED' || submission?.status === 'GRADED') {
    return (
      <div className="container mx-auto py-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Exam Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">Your Score</p>
              <p className="text-4xl font-bold">
                {submission?.percentage ? Math.round(submission.percentage) : 0}%
              </p>
              <p className="text-muted-foreground">
                {submission?.totalScore || 0} out of {submission?.exam?.totalScore || 100} points
              </p>
            </div>
            <Button onClick={() => navigate('/student/exams')} className="w-full">
              Back to Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = submission?.answers?.[currentQuestionIndex];

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/student/exams')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Exit
        </Button>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            remainingTime < 300 ? 'bg-red-100 text-red-600' : 'bg-muted'
          }`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono text-xl">{formatTime(remainingTime)}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>Progress</span>
          <span>{answeredCount}/{totalQuestions} answered</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {submission?.answers?.map((answer, index) => (
          <button
            key={answer.id}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
              currentQuestionIndex === index
                ? 'bg-emerald-600 text-white shadow-md'
                : answer.answer
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Current Question */}
      {currentQ && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
              <span className="text-sm text-muted-foreground">
                {currentQ.question?.score} points
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-lg font-medium">{currentQ.question?.text}</p>
            </div>

            {currentQ.question?.type === QuestionType.MCQ ? (
              <div className="space-y-3">
                {currentQ.question.options?.map((option, i) => {
                  const optionLetter = ['A', 'B', 'C', 'D'][i];
                  const isSelected = answers[currentQ.questionId] === optionLetter;
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={currentQ.questionId}
                        value={optionLetter}
                        checked={isSelected}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleAnswerChange(currentQ.questionId, value);
                          handleSaveAnswer(currentQ.questionId, value);
                        }}
                        className="sr-only"
                      />
                      <span className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {optionLetter}
                      </span>
                      <span className={`text-base ${isSelected ? 'font-semibold text-emerald-900' : 'text-slate-700'}`}>
                        {option}
                      </span>
                      {isSelected && (
                        <CheckCircle className="ml-auto w-5 h-5 text-emerald-600" />
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={answers[currentQ.questionId] || ''}
                  onChange={(e) => handleAnswerChange(currentQ.questionId, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={8}
                />
                <Button onClick={() => handleSaveAnswer(currentQ.questionId)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Answer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          disabled={currentQuestionIndex === 0}
          onClick={handlePrevious}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentExamPage;