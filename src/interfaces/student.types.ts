export interface StudentProfile {
  id: string;
  userId: string;
  classId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  class: {
    id: string;
    name: string;
    level: { name: string };
  } | null;
}

export interface Enrollment {
  id: string;
  subjectId: string;
  subject: {
    id: string;
    name: string;
    teacher: { user: { name: string } };
  };
}

export interface Grade {
  id: string;
  subjectId: string;
  value: number;
  subject: { name: string };
}

export interface Invoice {
  id: string;
  title: string;
  amount: number;
  paidAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  dueDate: string;
}

export interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: { name: string };
  room: string | null;
}