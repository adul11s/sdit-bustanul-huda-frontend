import { useState, useEffect, useCallback } from 'react';
import type { IPublicTeacher } from '../interfaces/landing.types';
import { landingService } from '../services/landing.service';

export function useTeachers() {
  const [teachers, setTeachers] = useState<IPublicTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await landingService.getPublicTeachers();
      setTeachers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return { teachers, loading, error, refetch: fetchTeachers };
}
