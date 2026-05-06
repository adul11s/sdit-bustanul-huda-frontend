export interface TeacherProfile {
  id: string;
  user: { name: string; email: string };
}

export interface Subject {
  id: string;
  name: string;
  code: string | null;
  _count: { enrollments: number; assignments: number; exams: number };
}

export interface ClassLevel {
  id: string;
  name: string;
  classes: Array<{
    id: string;
    name: string;
    homeroomTeacher: { user: { name: string } } | null;
    _count: { students: number };
  }>;
}

export interface Assignment {
  id: string;
  title: string;
  content: string;
  dueDate: string;
  subject: { name: string };
}

export interface Grade {
  id: string;
  studentId: string;
  value: number;
  subject: { name: string };
  student: { user: { name: string } };
}