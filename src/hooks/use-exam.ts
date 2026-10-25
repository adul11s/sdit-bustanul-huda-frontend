import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  IExam, 
  IQuestion, 
  ISubmission, 
  IStudentAnswer,
  IPaginatedResponse,
  ICreateExamDTO,
  ICreateQuestionDTO,
  QuestionType,
  ExamType
} from '../interfaces/exam.types';
import { examService } from '../services/exam.service';

export function useExamList(filters: { subjectId?: string; type?: string; isPublished?: boolean; search?: string }) {
  const [exams, setExams] = useState<IPaginatedResponse<IExam> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examService.getExams({
        subjectId: filters.subjectId,
        type: filters.type as ExamType,
        isPublished: filters.isPublished,
        search: filters.search,
        page: 1,
        limit: 10,
      });
      setExams(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.subjectId, filters.type, filters.isPublished, filters.search]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { exams, loading, error, refetch: fetchExams };
}

export function useExam(id: string) {
  const [exam, setExam] = useState<IExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examService.getExamById(id);
      setExam(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchExam();
  }, [id, fetchExam]);

  return { exam, loading, error, refetch: fetchExam };
}

export function useCreateExam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExam = useCallback(async (data: ICreateExamDTO) => {
    try {
      setLoading(true);
      setError(null);
      return await examService.createExam(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createExam, loading, error };
}

export function useQuestionManager(examId: string) {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const exam = await examService.getExamById(examId);
      setQuestions(exam.questions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const createQuestion = useCallback(async (data: Omit<ICreateQuestionDTO, 'examId'>) => {
    try {
      setLoading(true);
      const question = await examService.createQuestion({ ...data, examId });
      setQuestions(prev => [...prev, question]);
      return question;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const updateQuestion = useCallback(async (id: string, data: Partial<ICreateQuestionDTO>) => {
    try {
      setLoading(true);
      const question = await examService.updateQuestion(id, data);
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...question } : q));
      return question;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuestion = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await examService.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFromFile = useCallback(async (file: File) => {
    try {
      setLoading(true);
      const result = await examService.uploadQuestionsFromFile(examId, file);
      await fetchQuestions();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [examId, fetchQuestions]);

  useEffect(() => {
    if (examId) fetchQuestions();
  }, [examId, fetchQuestions]);

  return { 
    questions, 
    loading, 
    error, 
    createQuestion, 
    updateQuestion, 
    deleteQuestion, 
    uploadFromFile, 
    refetch: fetchQuestions 
  };
}

export function useExamTimer(timeLimit: number, submissionId: string, onTimeUp: () => void) {
  const [remainingTime, setRemainingTime] = useState(timeLimit * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onTimeUp]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    start();
  }, [start]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    remainingTime,
    isRunning,
    start,
    pause,
    resume,
    formattedTime: formatTime(remainingTime),
  };
}

export function useStudentExam(examId: string) {
  const [submission, setSubmission] = useState<ISubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const startExam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sub = await examService.startExam(examId);
      setSubmission(sub);
      setCurrentQuestionIndex(0);
      return sub;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const loadSubmission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sub = await examService.getStudentSubmission(examId);
      
      // If no submission exists, that's ok - we need to start one
      if (!sub) {
        setSubmission(null);
        setLoading(false);
        return;
      }
      
      setSubmission(sub);
      if (sub?.answers) {
        const firstUnanswered = sub.answers.findIndex(a => !a.answer);
        setCurrentQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
      }
    } catch (err: any) {
      // If error is "not found", that's ok - treat as no submission
      if (err.message?.toLowerCase().includes('not found') || err.message?.toLowerCase().includes('no submission')) {
        setSubmission(null);
        setLoading(false);
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const submitAnswer = useCallback(async (questionId: string, answer: string) => {
    if (!submission) return;
    try {
      const result = await examService.submitAnswer(submission.id, questionId, answer);
      setSubmission(prev => prev ? {
        ...prev,
        answers: prev.answers?.map(a => a.questionId === questionId ? result : a) || [result]
      } : null);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [submission]);

  const submitExam = useCallback(async () => {
    if (!submission) return;
    try {
      setLoading(true);
      const result = await examService.submitExam(submission.id);
      setSubmission(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [submission]);

  const autoSubmit = useCallback(async () => {
    if (!submission) return;
    try {
      const result = await examService.submitExam(submission.id);
      setSubmission(result);
      return result;
    } catch (err: any) {
      console.error('Auto-submit failed:', err);
    }
  }, [submission]);

  useEffect(() => {
    if (examId) loadSubmission();
  }, [examId, loadSubmission]);

  const currentQuestion = submission?.answers?.[currentQuestionIndex]?.question;
  const mcqAnswers = submission?.answers?.filter(a => a.question?.type === QuestionType.MCQ) || [];
  const essayAnswers = submission?.answers?.filter(a => a.question?.type === QuestionType.ESSAY) || [];
  const answeredCount = submission?.answers?.filter(a => a.answer).length || 0;
  const totalQuestions = submission?.answers?.length || 0;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return {
    submission,
    loading,
    error,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    currentQuestion,
    mcqAnswers,
    essayAnswers,
    answeredCount,
    totalQuestions,
    progress,
    startExam,
    loadSubmission,
    submitAnswer,
    submitExam,
    autoSubmit,
  };
}

export function useGrading(examId?: string) {
  const [pendingEssays, setPendingEssays] = useState<IPaginatedResponse<IStudentAnswer> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingEssays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examService.getPendingEssays({ examId, page: 1, limit: 20 });
      setPendingEssays(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const gradeEssay = useCallback(async (answerId: string, score: number, feedback?: string) => {
    try {
      setLoading(true);
      const result = await examService.gradeEssayAnswer(answerId, score, feedback);
      setPendingEssays(prev => prev ? {
        ...prev,
        data: prev.data.filter(a => a.id !== answerId),
        total: prev.total - 1,
      } : null);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingEssays();
  }, [fetchPendingEssays]);

  return { pendingEssays, loading, error, gradeEssay, refetch: fetchPendingEssays };
}