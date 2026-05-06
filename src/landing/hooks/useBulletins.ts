import { useState, useEffect, useCallback } from 'react';
import type { IBulletin } from '../interfaces/landing.types';
import { landingService } from '../services/landing.service';

export function useBulletins(limit = 6) {
  const [bulletins, setBulletins] = useState<IBulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBulletins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await landingService.getBulletins(limit);
      setBulletins(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchBulletins();
  }, [fetchBulletins]);

  return { bulletins, loading, error, refetch: fetchBulletins };
}
