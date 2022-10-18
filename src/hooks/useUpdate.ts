import { useRef, useEffect } from 'react';
import useEvent from './useEvent';

export default function useUpdate(callback: any, dep: any[] = []) {
  const isUpdate = useRef(false);

  const fn = useEvent(callback);

  useEffect(() => {
    if (!isUpdate.current) {
      isUpdate.current = true;
      return;
    }

    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ...dep]);
}
