import { PropsWithChildren, useEffect } from 'react'
import { useRootStore } from '../context/RootStoreContext'

export const OrgContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const { subscribe } = useRootStore()
  useEffect(() => {
    const unsubscribe = subscribe({
      type: 'subscribeToOrganization',
      organization_id: 'org1',
    })
    return () => {
      unsubscribe()
    }
  }, [])
  return <>{children}</>
}
