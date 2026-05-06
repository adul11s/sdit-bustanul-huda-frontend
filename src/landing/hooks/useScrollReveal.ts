import { useState, useEffect, useCallback } from 'react';

export function useScrollReveal(threshold = 0.12) {
  const [revealed, setRevealed] = useState<Set<Element>>(new Set());

  const observe = useCallback(() => {
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting && !revealed.has(entry.target)) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, i * 80);
            setRevealed((prev) => new Set([...prev, entry.target]));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    elements.forEach((el) => observer.observe(el));
    return observer;
  }, [threshold, revealed]);

  useEffect(() => {
    const observer = observe();
    return () => observer.disconnect();
  }, [observe]);

  return revealed;
}
