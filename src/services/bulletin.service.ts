import type { Bulletin } from '../interfaces/bulletin.types.js';

const API_BASE = '/api/bulletins';

class BulletinService {
  async getAll(category?: string, status?: string): Promise<Bulletin[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async getById(id: string): Promise<Bulletin> {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.data;
  }

  async create(data: { title: string; content: string; image?: string; category?: string; eventDate?: string; status?: string }): Promise<Bulletin> {
    const res = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async update(id: string, data: Partial<{ title: string; content: string; image: string; category: string; status: string }>): Promise<Bulletin> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    if (!res.ok) throw new Error(response.error);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete bulletin');
  }
}

export const bulletinService = new BulletinService();