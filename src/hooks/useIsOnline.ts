import { useEffect, useState } from 'react'
import { useRootStore } from '../context/RootStoreContext'

export const useIsOnline = () => {
  const { subscribeStatus } = useRootStore()
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const onChange = (online: boolean) => {
      setIsOnline(online)
    }
    const unsubscribe = subscribeStatus(onChange)
    return () => {
      unsubscribe()
    }
  }, [])

  return isOnline
}
