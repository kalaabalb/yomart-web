import { useCallback, useEffect, useState } from 'react';

export function useResource(load, key = '') {
  const [value, setValue] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setValue(null);
    load(controller.signal)
      .then((result) => setValue(result))
      .catch((failure) => {
        if (failure.name !== 'AbortError') setError(failure.message || 'Could not load this information.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [key, revision]);

  const retry = useCallback(() => setRevision((current) => current + 1), []);
  return { value, error, loading, retry };
}
