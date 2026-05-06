import type { IBulletin, IInquiryPayload, IInquiryResponse, IPublicTeacher } from '../interfaces/landing.types';

const API_BASE = '/api/public';

class LandingService {
  async getBulletins(limit = 6): Promise<IBulletin[]> {
    const res = await fetch(`${API_BASE}/bulletins?limit=${limit}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch bulletins');
    return json.data || [];
  }

  async getPublicTeachers(): Promise<IPublicTeacher[]> {
    const res = await fetch(`${API_BASE}/teachers`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch teachers');
    return json.data || [];
  }

  async submitInquiry(data: IInquiryPayload): Promise<IInquiryResponse> {
    const res = await fetch(`${API_BASE}/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to submit inquiry');
    return json.data;
  }
}

export const landingService = new LandingService();
export default landingService;
