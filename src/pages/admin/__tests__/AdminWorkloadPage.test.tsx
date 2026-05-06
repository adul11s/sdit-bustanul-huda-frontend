import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminWorkloadPage from '../AdminWorkloadPage';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockWorkloads = [
  { teacherId: 't1', teacherName: 'Pak Budi Santoso', averageWeeklyHours: 10 },
  { teacherId: 't2', teacherName: 'Ibu Siti Aminah', averageWeeklyHours: 8 },
];

const mockDetail = {
  summary: {
    teacherId: 't1',
    teacherName: 'Pak Budi Santoso',
    averageWeeklyHours: 10,
    weekly: [{ weekStart: '2025-01-01', weekEnd: '2025-01-07', totalHours: 10, scheduleCount: 5 }],
    monthly: [{ year: 2025, month: 7, totalHours: 40, scheduleCount: 20 }],
  },
  schedules: [
    { id: 's1', className: 'Grade 1 - 1A', subjectName: 'Matematika', dayOfWeek: 1, startTime: '07:00', endTime: '09:00', room: 'Ruang 1A', durationHours: 2 },
  ],
};

describe('AdminWorkloadPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((url: string) => {
      if (url === '/api/admin/workload') {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockWorkloads }) } as Response);
      }
      if (url.includes('/api/admin/workload/') && url.includes('/detail')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockDetail }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    }) as any;
  });

  it('renders page title', async () => {
    render(<MemoryRouter><AdminWorkloadPage /></MemoryRouter>);
    expect(screen.getByText('Teacher Workload')).toBeInTheDocument();
    expect(screen.getByText('Overview of teaching hours and schedule distribution')).toBeInTheDocument();
  });

  it('loads and displays workload data', async () => {
    render(<MemoryRouter><AdminWorkloadPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Pak Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('Ibu Siti Aminah')).toBeInTheDocument();
    });
    expect(screen.getByText('10.0 hrs')).toBeInTheDocument();
    expect(screen.getByText('8.0 hrs')).toBeInTheDocument();
  });

  it('opens details dialog when clicking Details', async () => {
    render(<MemoryRouter><AdminWorkloadPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Pak Budi Santoso')).toBeInTheDocument();
    });

    const detailsButtons = screen.getAllByText('Details');
    fireEvent.click(detailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Pak Budi Santoso - Workload Detail')).toBeInTheDocument();
    });
  });
});
