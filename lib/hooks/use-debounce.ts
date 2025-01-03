'use client';

import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);

  const debouncedFn = useCallback(
    async (...args: Parameters<T>) => {
      if (isExecutingRef.current) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return new Promise<ReturnType<T>>((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            isExecutingRef.current = true;
            const result = await fn(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            isExecutingRef.current = false;
          }
        }, delay);
      });
    },
    [fn, delay]
  );

  return {
    execute: debouncedFn,
    isExecuting: isExecutingRef.current,
  };
}