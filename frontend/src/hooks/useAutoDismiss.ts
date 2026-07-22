import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook for managing state that automatically resets to empty string after a specified duration.
 * @param initialState Initial text value (default empty string)
 * @param delayMs Time in milliseconds before state is cleared (default 5000ms = 5 seconds)
 */
export function useAutoDismissState(initialState: string = '', delayMs: number = 5000) {
  const [value, setValue] = useState<string>(initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setTimedValue = useCallback(
    (newValue: string) => {
      setValue(newValue);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (newValue) {
        timerRef.current = setTimeout(() => {
          setValue('');
        }, delayMs);
      }
    },
    [delayMs],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return [value, setTimedValue] as const;
}
