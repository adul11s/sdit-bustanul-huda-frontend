import { useState, useCallback } from 'react';
import type { IInquiryPayload, IInquiryResponse } from '../interfaces/landing.types';
import { landingService } from '../services/landing.service';

export function useInquiry() {
  const [result, setResult] = useState<IInquiryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitInquiry = useCallback(async (data: IInquiryPayload) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const response = await landingService.submitInquiry(data);
      setResult(response);
      setSuccess(true);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setSuccess(false);
  }, []);

  return { submitInquiry, result, loading, error, success, reset };
}
