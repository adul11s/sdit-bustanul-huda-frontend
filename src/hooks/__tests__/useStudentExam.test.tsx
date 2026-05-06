import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStudentExam } from '../../hooks/use-exam';
import { examService } from '../../services/exam.service';
import { AuthProvider } from '../../lib/auth-context';

vi.mock('../../services/exam.service', () => ({
  examService: {
    startExam: vi.fn(),
    getStudentSubmission: vi.fn(),
    submitAnswer: vi.fn(),
    submitExam: vi.fn(),
  },
}));

import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useStudentExam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start exam successfully', async () => {
    const mockSubmission = {
      id: 'sub-1',
      examId: 'exam-1',
      status: 'IN_PROGRESS',
      answers: [
        { id: 'a1', questionId: 'q1', answer: '', question: { id: 'q1', text: 'Q1', type: 'MCQ' } },
      ],
    };

    (examService.startExam as any).mockResolvedValue(mockSubmission);

    const { result } = renderHook(() => useStudentExam('exam-1'), { wrapper });

    await act(async () => {
      const sub = await result.current.startExam();
      expect(sub).toEqual(mockSubmission);
    });

    expect(result.current.submission).toEqual(mockSubmission);
    expect(result.current.totalQuestions).toBe(1);
  });

  it('should load existing submission', async () => {
    const mockSubmission = {
      id: 'sub-1',
      examId: 'exam-1',
      status: 'DRAFT',
      answers: [
        { id: 'a1', questionId: 'q1', answer: '', question: { id: 'q1', text: 'Q1', type: 'MCQ' } },
      ],
    };

    (examService.getStudentSubmission as any).mockResolvedValue(mockSubmission);

    const { result } = renderHook(() => useStudentExam('exam-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.submission).toEqual(mockSubmission);
  });

  it('should handle no submission found', async () => {
    (examService.getStudentSubmission as any).mockRejectedValue(new Error('No submission found'));

    const { result } = renderHook(() => useStudentExam('exam-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.submission).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should submit answer and update state', async () => {
    const mockSubmission = {
      id: 'sub-1',
      examId: 'exam-1',
      status: 'IN_PROGRESS',
      answers: [
        { id: 'a1', questionId: 'q1', answer: '', question: { id: 'q1', text: 'Q1', type: 'MCQ' } },
      ],
    };

    const updatedAnswer = { id: 'a1', questionId: 'q1', answer: 'A', question: { id: 'q1', text: 'Q1', type: 'MCQ' } };

    (examService.getStudentSubmission as any).mockResolvedValue(mockSubmission);
    (examService.submitAnswer as any).mockResolvedValue(updatedAnswer);

    const { result } = renderHook(() => useStudentExam('exam-1'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.submitAnswer('q1', 'A');
    });

    expect(examService.submitAnswer).toHaveBeenCalledWith('sub-1', 'q1', 'A');
    expect(result.current.answeredCount).toBe(1);
  });

  it('should submit exam successfully', async () => {
    const mockSubmission = {
      id: 'sub-1',
      examId: 'exam-1',
      status: 'IN_PROGRESS',
      answers: [],
    };

    const submitted = { ...mockSubmission, status: 'SUBMITTED' };

    (examService.getStudentSubmission as any).mockResolvedValue(mockSubmission);
    (examService.submitExam as any).mockResolvedValue(submitted);

    const { result } = renderHook(() => useStudentExam('exam-1'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.submitExam();
    });

    expect(examService.submitExam).toHaveBeenCalledWith('sub-1');
    expect(result.current.submission?.status).toBe('SUBMITTED');
  });
});
