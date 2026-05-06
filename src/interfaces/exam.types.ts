export enum ExamType {
  MCQ = 'MCQ',
  ESSAY = 'ESSAY',
}

export enum QuestionType {
  MCQ = 'MCQ',
  ESSAY = 'ESSAY',
}

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}

export enum GradingStatus {
  PENDING = 'PENDING',
  AUTO_GRADED = 'AUTO_GRADED',
  MANUALLY_GRADED = 'MANUALLY_GRADED',
  FINAL = 'FINAL',
}

export interface IExam {
  id: string;
  title: string;
  description?: string;
  type: ExamType;
  subjectId: string;
  subject?: ISubject;
  dueDate?: string;
  startTime?: string;
  timeLimit: number;
  totalScore: number;
  isPublished: boolean;
  isActive: boolean;
  allowRetry: boolean;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  questions?: IQuestion[];
  submissions?: ISubmission[];
  _count?: {
    questions: number;
    submissions: number;
  };
}

export interface IQuestion {
  id: string;
  examId: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  score: number;
  order: number;
  explanation?: string;
  isActive: boolean;
  createdAt: string;
}

export interface IStudentAnswer {
  id: string;
  questionId: string;
  question?: IQuestion;
  submissionId: string;
  studentId: string;
  answer: string;
  score?: number;
  gradingStatus: GradingStatus;
  feedback?: string;
  gradedAt?: string;
  gradedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubmission {
  id: string;
  examId: string;
  exam?: IExam;
  studentId: string;
  student?: IStudent;
  status: SubmissionStatus;
  startedAt?: string;
  submittedAt?: string;
  totalScore?: number;
  percentage?: number;
  ipAddress?: string;
  userAgent?: string;
  isAutoSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
  answers?: IStudentAnswer[];
}

export interface ICreateExamDTO {
  title: string;
  description?: string;
  type: ExamType;
  subjectId: string;
  dueDate?: string;
  startTime?: string;
  timeLimit: number;
  totalScore?: number;
  allowRetry?: boolean;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

export interface IUpdateExamDTO extends Partial<ICreateExamDTO> {
  isPublished?: boolean;
}

export interface ICreateQuestionDTO {
  examId: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  score: number;
  order?: number;
  explanation?: string;
}

export interface IUpdateQuestionDTO extends Partial<ICreateQuestionDTO> {
  isActive?: boolean;
}

export interface ICreateQuestionsFromFileDTO {
  examId: string;
  questions: ICreateQuestionDTO[];
}

export interface IGradeAnswerDTO {
  answerId: string;
  score: number;
  feedback?: string;
}

export interface IQuestionFileRow {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  score: number;
  type: string;
}

export interface ISubject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  teacherId: string;
  createdAt: string;
}

export interface IStudent {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  classId?: string;
  createdAt: string;
}

export interface ITeacher {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IExamFilters {
  subjectId?: string;
  type?: ExamType;
  isPublished?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ISubmissionFilters {
  examId?: string;
  status?: SubmissionStatus;
  studentId?: string;
  page?: number;
  limit?: number;
}

export interface IStudentExamFilters {
  status?: SubmissionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ITimerState {
  remainingTime: number;
  isRunning: boolean;
  startedAt: number;
}

export interface IExamAttempt {
  examId: string;
  submissionId: string;
  currentQuestionIndex: number;
  answers: Map<string, string>;
  timeLimit: number;
}

export interface IFileValidationResult {
  isValid: boolean;
  errors: string[];
  validRows: IQuestionFileRow[];
  totalRows: number;
}