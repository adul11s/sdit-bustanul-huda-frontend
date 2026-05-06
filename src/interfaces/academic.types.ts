export interface ClassLevel {
  id: string;
  name: string;
  classes: Array<{
    id: string;
    name: string;
    homeroomTeacher: { user: { name: string } | null };
    _count: { students: number };
  }>;
}

export interface Class {
  id: string;
  name: string;
  level: { name: string };
}

export interface Subject {
  id: string;
  name: string;
  code: string | null;
  teacher: { user: { name: string } };
  _count: { enrollments: number; assignments: number; exams: number };
}

export interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: { name: string };
  class: { name: string };
}