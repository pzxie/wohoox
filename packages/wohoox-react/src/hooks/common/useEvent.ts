import { useRef, useCallback } from 'react'

export default function useEvent<T extends (...arg: any) => any>(fn: T): T {
  const fnRef = useRef<typeof fn | null>()

  const callback = useCallback((...arg: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
    if (typeof fnRef.current === 'function') return fnRef.current(...arg)
  }, [])

  fnRef.current = fn

  return callback as T
}
