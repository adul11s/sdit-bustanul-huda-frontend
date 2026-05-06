import type { Subject, ClassLevel, Assignment, Grade } from '../interfaces/teacher.types.js';

const API_BASE = '/api/teacher';

class TeacherService {
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch(`${API_BASE}/subjects`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getClassLevels(): Promise<ClassLevel[]> {
    const res = await fetch(`${API_BASE}/classes`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getAssignments(subjectId: string): Promise<Assignment[]> {
    const res = await fetch(`${API_BASE}/assignments?subjectId=${subjectId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async createAssignment(data: { title: string; content: string; dueDate: string; subjectId: string }): Promise<Assignment> {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async getExams(subjectId?: string): Promise<unknown[]> {
    const url = subjectId ? `${API_BASE}/exams?subjectId=${subjectId}` : `${API_BASE}/exams`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async createExam(data: { title: string; date: string; type: string; subjectId: string }): Promise<unknown> {
    const res = await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async createGrade(data: { studentId: string; subjectId: string; value: number; comment?: string }): Promise<Grade> {
    const res = await fetch(`${API_BASE}/grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async markAttendance(data: { studentId: string; date: string; status: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
  }

  async bulkAttendance(data: { classId: string; date: string; status: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
  }

  async getStudents(classId?: string): Promise<unknown[]> {
    const url = classId ? `${API_BASE}/students?classId=${classId}` : `${API_BASE}/students`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }
}

export const teacherService = new TeacherService();