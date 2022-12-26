import { createContext, PropsWithChildren, useContext, useRef } from 'react'
import { makeRootService } from '../services/root-service'

export const RootStoreContext =
  // @ts-expect-error - We know the app will have the context provider
  createContext<ReturnType<typeof makeRootService>>(null)

export const useRootStore = () => useContext(RootStoreContext)

export const RootStoreProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const storeRef = useRef<ReturnType<typeof makeRootService>>()
  if (!storeRef.current) {
    storeRef.current = makeRootService()
  }
  return (
    <RootStoreContext.Provider value={storeRef.current}>
      {children}
    </RootStoreContext.Provider>
  )
}
