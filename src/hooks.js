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

/** Fades [data-reveal] elements in as they scroll into view. Content stays visible without JS or IntersectionObserver. */
export function useRevealOnScroll(routeKey) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;
    const root = document.documentElement;
    root.classList.add('js-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    const seen = new WeakSet();
    const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((element) => {
      if (seen.has(element)) return;
      seen.add(element);
      observer.observe(element);
    });
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, [routeKey]);
}
