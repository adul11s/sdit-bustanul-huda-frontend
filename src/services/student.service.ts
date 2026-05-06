import type { StudentProfile, Enrollment, Grade, Invoice, Schedule } from '../interfaces/student.types.js';

const API_BASE = '/api/student';

class StudentService {
  async getProfile(): Promise<StudentProfile> {
    const res = await fetch(`${API_BASE}/profile`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getSubjects(): Promise<Enrollment[]> {
    const res = await fetch(`${API_BASE}/subjects`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getSchedule(): Promise<Schedule[]> {
    const res = await fetch(`${API_BASE}/schedule`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getGrades(): Promise<Grade[]> {
    const res = await fetch(`${API_BASE}/grades`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getBilling(): Promise<{ totalBilled: number; totalPaid: number; totalOutstanding: number; invoices: Invoice[] }> {
    const res = await fetch(`${API_BASE}/billing`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }
}

export const studentService = new StudentService();