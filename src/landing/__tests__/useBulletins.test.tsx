import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBulletins } from '../hooks/useBulletins';
import { landingService } from '../services/landing.service';

vi.mock('../services/landing.service', () => ({
  landingService: {
    getBulletins: vi.fn(),
  },
}));

describe('useBulletins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch bulletins on mount', async () => {
    const mockBulletins = [
      { id: '1', title: 'Test', content: 'Content', category: 'ANNOUNCEMENT', status: 'ONGOING', createdAt: '2024-01-01' },
    ];

    (landingService.getBulletins as any).mockResolvedValue(mockBulletins);

    const { result } = renderHook(() => useBulletins(6));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.bulletins).toEqual(mockBulletins);
    expect(result.current.error).toBeNull();
    expect(landingService.getBulletins).toHaveBeenCalledWith(6);
  });

  it('should handle error state', async () => {
    (landingService.getBulletins as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBulletins());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.bulletins).toEqual([]);
  });

  it('should allow refetch', async () => {
    const mockBulletins = [{ id: '1', title: 'Test', content: '', category: '', status: '', createdAt: '' }];
    (landingService.getBulletins as any).mockResolvedValue(mockBulletins);

    const { result } = renderHook(() => useBulletins());

    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.clearAllMocks();
    (landingService.getBulletins as any).mockResolvedValue([...mockBulletins, { id: '2', title: 'Test 2', content: '', category: '', status: '', createdAt: '' }]);

    await result.current.refetch();

    expect(landingService.getBulletins).toHaveBeenCalledTimes(1);
  });
});
