import { useEffect, useState } from 'react'

export const useWindowEvent = <T extends {}>(
  event: string,
  transform: (w: Window & typeof globalThis) => T,
  deps: any[] = []
): T => {
  const [value, setValue] = useState<T>(transform(window))
  useEffect(() => {
    function onEvent() {
      setValue(transform(window))
    }
    window.addEventListener(event, onEvent)
    return function unsubscribe() {
      window.removeEventListener(event, onEvent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, transform, ...deps])
  return value
}
