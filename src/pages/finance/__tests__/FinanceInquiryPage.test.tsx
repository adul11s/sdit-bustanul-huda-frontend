import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FinanceInquiryPage from '../FinanceInquiryPage';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockInquiries = [
  { id: 'iq1', parentName: 'Bapak Abdul Rahman', studentName: 'Aisyah Rahman', phone: '081234567890', email: 'abdul@gmail.com', gradeInterest: 'Grade 1', message: 'Interested', status: 'NEW', createdAt: '2025-07-01T00:00:00Z' },
  { id: 'iq2', parentName: 'Ibu Siti Khadijah', studentName: 'Muhammad Khairul', phone: '081298765432', gradeInterest: 'Grade 2', message: 'Quota check', status: 'CONTACTED', createdAt: '2025-07-02T00:00:00Z' },
  { id: 'iq3', parentName: 'Bapak Hadi Wijaya', studentName: 'Nabila Wijaya', phone: '081345678901', gradeInterest: 'Grade 3', message: 'Fees', status: 'ENROLLED', createdAt: '2025-07-03T00:00:00Z' },
];

describe('FinanceInquiryPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((url: string, init?: RequestInit) => {
      if (url === '/api/finance/inquiries') {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockInquiries }) } as Response);
      }
      if (url.includes('/api/finance/inquiries/') && url.includes('/status')) {
        const body = JSON.parse((init as any)?.body || '{}');
        const id = url.split('/')[4];
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: { ...mockInquiries.find(i => i.id === id), status: body.status } }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    }) as any;
  });

  it('renders page title and inquiry count', async () => {
    render(
      <MemoryRouter>
        <FinanceInquiryPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Inquiries')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('3 total inquiries')).toBeInTheDocument();
    });
  });

  it('displays inquiry rows with correct data', async () => {
    render(
      <MemoryRouter>
        <FinanceInquiryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bapak Abdul Rahman')).toBeInTheDocument();
      expect(screen.getByText('Ibu Siti Khadijah')).toBeInTheDocument();
      expect(screen.getByText('Bapak Hadi Wijaya')).toBeInTheDocument();
    });

    expect(screen.getByText('Aisyah Rahman')).toBeInTheDocument();
    expect(screen.getByText('Grade 1')).toBeInTheDocument();
    expect(screen.getByText('Grade 2')).toBeInTheDocument();
  });

  it('shows status badges', async () => {
    render(
      <MemoryRouter>
        <FinanceInquiryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('NEW').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('CONTACTED').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('ENROLLED').length).toBeGreaterThanOrEqual(1);
    });
  });
});
