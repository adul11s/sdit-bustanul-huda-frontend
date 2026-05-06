import { 
  IExam, 
  IQuestion, 
  ICreateExamDTO, 
  IUpdateExamDTO, 
  ICreateQuestionDTO,
  ISubmission,
  IStudentAnswer,
  IPaginatedResponse,
  IExamFilters,
  ISubmissionFilters,
  GradingStatus,
  SubmissionStatus
} from '../interfaces/exam.types';

const API_BASE = '/api/exam';

function getAuthHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  
  return headers;
}

class ExamService {
  async createExam(data: ICreateExamDTO): Promise<IExam> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async getExamById(id: string): Promise<IExam> {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async getExams(filters: IExamFilters): Promise<IPaginatedResponse<IExam>> {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.type) params.append('type', filters.type);
    if (filters.isPublished !== undefined) params.append('isPublished', String(filters.isPublished));
    if (filters.search) params.append('search', filters.search);
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 10));

    const res = await fetch(`${API_BASE}/exams?${params}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async updateExam(id: string, data: IUpdateExamDTO): Promise<IExam> {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async publishExam(id: string): Promise<IExam> {
    const res = await fetch(`${API_BASE}/exams/${id}/publish`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async deleteExam(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message);
    }
  }

  async createQuestion(data: ICreateQuestionDTO): Promise<IQuestion> {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async updateQuestion(id: string, data: Partial<ICreateQuestionDTO>): Promise<IQuestion> {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async deleteQuestion(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message);
    }
  }

  async uploadQuestionsFromFile(examId: string, file: File): Promise<{ count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', examId);

    const res = await fetch(`${API_BASE}/exams/${examId}/questions/file`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async getExamSubmissions(examId: string, filters: ISubmissionFilters): Promise<IPaginatedResponse<ISubmission>> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.studentId) params.append('studentId', filters.studentId);
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 10));

    const res = await fetch(`${API_BASE}/exams/${examId}/submissions?${params}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async gradeEssayAnswer(answerId: string, score: number, feedback?: string): Promise<{ answer: IStudentAnswer; finalPercentage: number }> {
    const res = await fetch(`${API_BASE}/answers/grade`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answerId, score, feedback }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async getPendingEssays(filters: { examId?: string; page?: number; limit?: number }): Promise<IPaginatedResponse<IStudentAnswer>> {
    const params = new URLSearchParams();
    if (filters.examId) params.append('examId', filters.examId);
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 10));

    const res = await fetch(`${API_BASE}/essays/pending?${params}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async getAvailableExams(studentId: string, page = 1, limit = 10): Promise<IPaginatedResponse<IExam>> {
    const res = await fetch(`${API_BASE}/student/exams?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async startExam(examId: string): Promise<ISubmission> {
    const res = await fetch(`${API_BASE}/student/exams/${examId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async getStudentSubmission(examId: string): Promise<ISubmission> {
    const res = await fetch(`${API_BASE}/student/exams/${examId}/submission`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'No submission found');
    return json.data;
  }

  async submitAnswer(submissionId: string, questionId: string, answer: string): Promise<IStudentAnswer> {
    const res = await fetch(`${API_BASE}/student/submissions/${submissionId}/answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ submissionId, questionId, answer }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }

  async submitExam(submissionId: string): Promise<ISubmission> {
    const res = await fetch(`${API_BASE}/student/submissions/${submissionId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  }
}

export const examService = new ExamService();
export default examService;
