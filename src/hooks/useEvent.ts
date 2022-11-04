import { useRef, useCallback } from 'react';

export default function useEvent<T extends (...arg: any) => any>(fn: T): T {
  const fnRef = useRef<typeof fn | null>();

  const callback = useCallback((...arg: any) => {
    if (typeof fnRef.current === 'function') return fnRef.current(...arg);
  }, []);

  fnRef.current = fn;

  return callback as T;
}
