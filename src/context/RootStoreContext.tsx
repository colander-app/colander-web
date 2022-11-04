import { createContext, PropsWithChildren, useContext, useRef } from 'react'
import { makeRootService, RootService } from '../services/root-service'

// @ts-expect-error - We know the app will have the context provider
export const RootStoreContext = createContext<RootService>(null)

export const useRootStore = () => useContext(RootStoreContext)

export const RootStoreProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const storeRef = useRef<RootService>()
  if (!storeRef.current) {
    storeRef.current = makeRootService()
  }
  return (
    <RootStoreContext.Provider value={storeRef.current}>
      {children}
    </RootStoreContext.Provider>
  )
}
