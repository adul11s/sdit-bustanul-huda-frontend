import type { ClassLevel, Class, Subject, AcademicYear, Schedule } from '../interfaces/academic.types.js';

const API_BASE = '/api/academic';

class AcademicService {
  async getClassLevels(): Promise<ClassLevel[]> {
    const res = await fetch(`${API_BASE}/class-levels`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getClasses(): Promise<Class[]> {
    const res = await fetch(`${API_BASE}/classes`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getSubjects(teacherId?: string): Promise<Subject[]> {
    const url = teacherId ? `${API_BASE}/subjects?teacherId=${teacherId}` : `${API_BASE}/subjects`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    const res = await fetch(`${API_BASE}/academic-years`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async setCurrentAcademicYear(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/academic-years/set-current/${id}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to set current academic year');
  }

  async createClass(data: { name: string; levelId: string }): Promise<Class> {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async createSubject(data: { name: string; code?: string; description?: string; teacherId: string }): Promise<Subject> {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async getSchedules(classId?: string): Promise<Schedule[]> {
    const url = classId ? `${API_BASE}/schedules?classId=${classId}` : `${API_BASE}/schedules`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async createSchedule(data: { subjectId: string; classId: string; academicYearId: string; dayOfWeek: number; startTime: string; endTime: string }): Promise<Schedule> {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async createAcademicYear(data: { name: string; startDate: string; endDate: string }): Promise<AcademicYear> {
    const res = await fetch(`${API_BASE}/academic-years`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }
}

export const academicService = new AcademicService();