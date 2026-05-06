import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminStudentManagementPage from '../AdminStudentManagementPage';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockLevels = [
  { id: 'lvl1', name: 'Grade 1', classes: [{ id: 'cls1', name: '1A', levelId: 'lvl1' }] },
  { id: 'lvl2', name: 'Grade 2', classes: [{ id: 'cls2', name: '2A', levelId: 'lvl2' }] },
];

const mockUnassigned = [
  { id: 'stu1', user: { name: 'Ahmad Fauzi', email: 'ahmad@email.com', gender: 'MALE' } },
  { id: 'stu2', user: { name: 'Siti Aminah', email: 'siti@email.com', gender: 'FEMALE' } },
];

const mockClassStudents = [
  { id: 'stu3', user: { name: 'Budi Santoso', email: 'budi@email.com', gender: 'MALE' }, class: { name: '1A', level: { name: 'Grade 1' } } },
];

describe('AdminStudentManagementPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/api/admin/class-levels')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockLevels }) } as Response);
      }
      if (url.includes('/api/admin/students/unassigned')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockUnassigned }) } as Response);
      }
      if (url.includes('/api/admin/classes/') && url.includes('/students')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockClassStudents }) } as Response);
      }
      if (url.includes('/transfer-history')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: [] }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: true, data: {} }) } as Response);
    }) as any;
  });

  it('renders page title and tabs', async () => {
    render(
      <MemoryRouter>
        <AdminStudentManagementPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Student Class Management')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('Unassigned Students').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Class Rosters')).toBeInTheDocument();
    });
  });

  it('displays unassigned students', async () => {
    render(
      <MemoryRouter>
        <AdminStudentManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
    });
  });

  it('switches to class rosters tab', async () => {
    render(
      <MemoryRouter>
        <AdminStudentManagementPage />
      </MemoryRouter>
    );

    const rostersTab = await screen.findByText('Class Rosters');
    fireEvent.click(rostersTab);

    await waitFor(() => {
      expect(screen.getByText('Select a class to view and manage its students')).toBeInTheDocument();
    });
  });
});
