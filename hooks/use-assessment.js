import { useState, useCallback } from 'react';
import { 
  submitSpeaking, 
  getSpeakingResults,
  getWritingResultsByAnswer
} from '@/lib/api/attempt';

export function useAssessment(type = 'speaking') {
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const pollResults = useCallback(async (attemptId, answerId, submissionId = null) => {
    setPolling(true);
    const maxAttempts = 40;
    const pollInterval = 3000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        let res;
        if (type === 'speaking' && submissionId) {
          res = await getSpeakingResults(submissionId);
        } else if (type === 'writing') {
          res = await getWritingResultsByAnswer(attemptId, answerId);
        }
        
        if (res?.success && res.data?.aiScore !== null) {
          setResults(res.data);
          setPolling(false);
          return res.data;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
      } catch (err) {
        setError(err.message || 'Lỗi khi lấy kết quả');
        setPolling(false);
        throw err;
      }
    }

    setError('Chấm điểm quá lâu. Vui lòng thử lại sau.');
    setPolling(false);
    throw new Error('Timeout');
  }, [type]);

  const submit = useCallback(async (attemptId, answerId, audioUrl = null) => {
    try {
      setLoading(true);
      setError(null);

      if (type === 'speaking') {
        const res = await submitSpeaking(attemptId, answerId, audioUrl);
        if (!res.success) throw new Error(res.error);
        
        const submissionId = res.data?.id;
        if (submissionId) {
          await pollResults(attemptId, answerId, submissionId);
        }
      } else if (type === 'writing') {
        // Writing auto-created, just poll
        await pollResults(attemptId, answerId);
      }
    } catch (err) {
      setError(err.message || 'Không thể submit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [type, pollResults]);

  return {
    submit,
    loading,
    polling,
    error,
    results,
    setError
  };
}
