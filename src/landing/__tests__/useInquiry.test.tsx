import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInquiry } from '../hooks/useInquiry';
import { landingService } from '../services/landing.service';

vi.mock('../services/landing.service', () => ({
  landingService: {
    submitInquiry: vi.fn(),
  },
}));

describe('useInquiry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should submit inquiry successfully', async () => {
    const payload = {
      parentName: 'John',
      studentName: 'Jane',
      phone: '081234567890',
      gradeInterest: 'Kelas 1',
    };

    const mockResponse = { id: 'inq-1', ...payload, status: 'NEW', createdAt: '2024-01-01' };
    (landingService.submitInquiry as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useInquiry());

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);

    let response;
    await act(async () => {
      response = await result.current.submitInquiry(payload);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.result).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(landingService.submitInquiry).toHaveBeenCalledWith(payload);
    expect(response).toEqual(mockResponse);
  });

  it('should handle submission error', async () => {
    const payload = {
      parentName: 'John',
      studentName: 'Jane',
      phone: '081234567890',
      gradeInterest: 'Kelas 1',
    };

    (landingService.submitInquiry as any).mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useInquiry());

    await act(async () => {
      await expect(result.current.submitInquiry(payload)).rejects.toThrow('Server error');
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('Server error');
  });

  it('should reset state', async () => {
    const payload = {
      parentName: 'John',
      studentName: 'Jane',
      phone: '081234567890',
      gradeInterest: 'Kelas 1',
    };

    (landingService.submitInquiry as any).mockResolvedValue({ id: 'inq-1', ...payload, status: 'NEW' });

    const { result } = renderHook(() => useInquiry());

    await act(async () => {
      await result.current.submitInquiry(payload);
    });

    expect(result.current.success).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.success).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
