import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminSchedulePage from '../AdminSchedulePage';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockSubjects = [
  { id: 'sub1', name: 'Matematika', teacher: { user: { name: 'Pak Budi' } } },
  { id: 'sub2', name: 'IPA', teacher: { user: { name: 'Ibu Siti' } } },
];

const mockLevels = [
  { id: 'lvl1', name: 'Grade 1', classes: [{ id: 'cls1', name: '1A' }] },
  { id: 'lvl2', name: 'Grade 2', classes: [{ id: 'cls2', name: '2A' }] },
];

const mockYears = [
  { id: 'yr1', name: '2025/2026' },
];

const mockSchedules = [
  { id: 'sch1', dayOfWeek: 1, startTime: '07:00', endTime: '09:00', room: 'Ruang 1A', subject: { id: 'sub1', name: 'Matematika', teacher: { user: { name: 'Pak Budi' } } }, class: { id: 'cls1', name: '1A', level: { name: 'Grade 1' } } },
  { id: 'sch2', dayOfWeek: 2, startTime: '09:00', endTime: '11:00', room: 'Ruang 1A', subject: { id: 'sub2', name: 'IPA', teacher: { user: { name: 'Ibu Siti' } } }, class: { id: 'cls1', name: '1A', level: { name: 'Grade 1' } } },
];

describe('AdminSchedulePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/api/admin/subjects')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockSubjects }) } as Response);
      }
      if (url.includes('/api/admin/class-levels')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockLevels }) } as Response);
      }
      if (url.includes('/api/admin/academic-years')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockYears }) } as Response);
      }
      if (url.includes('/api/admin/schedules')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockSchedules }) } as Response);
      }
      if (url === '/api/admin/schedules') {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: { id: 'new-sch' } }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: [] }) } as Response);
    }) as any;
  });

  it('renders page title and description', async () => {
    render(
      <MemoryRouter>
        <AdminSchedulePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Schedule Management')).toBeInTheDocument();
    expect(screen.getByText('Create and view class schedules')).toBeInTheDocument();
  });

  it('loads metadata on mount', async () => {
    render(
      <MemoryRouter>
        <AdminSchedulePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/subjects');
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/class-levels');
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/academic-years');
    });
  });

  it('shows prompt to select filters when none selected', async () => {
    render(
      <MemoryRouter>
        <AdminSchedulePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Select a class and academic year to view schedules')).toBeInTheDocument();
    });
  });
});
