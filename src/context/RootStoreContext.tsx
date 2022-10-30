import moment from 'moment'
import { createContext, PropsWithChildren, useContext, useRef } from 'react'
import { createRootStore, Resource, Event } from '../store'

type RootStoreType = ReturnType<typeof createRootStore>

export const RootStoreContext = createContext<RootStoreType>(createRootStore())

export const useRootStore = () => useContext(RootStoreContext)

const makeEvents = () =>
  [...new Array(Math.floor(Math.random() * 15))].map((_, id) => {
    const start = moment()
      .startOf('day')
      .add(Math.floor(Math.random() * 35) - 2, 'days')
      .toDate()
    const end = moment(start)
      .add(Math.floor(Math.random() * 15), 'days')
      .toDate()
    return Event.create({
      id: `${id + 1}`,
      start,
      end,
      label: `${id + 1}:${moment(start).format('MM/DD')}-${moment(end).format(
        'MM/DD'
      )}`,
    })
  })

export const RootStoreProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const storeRef = useRef<RootStoreType>()
  if (!storeRef.current) {
    storeRef.current = createRootStore()
    storeRef.current.replaceResources([
      Resource.create({ id: '1', name: 'tom', events: makeEvents() }),
      Resource.create({ id: '2', name: 'susan', events: makeEvents() }),
      Resource.create({ id: '3', name: 'gray', events: makeEvents() }),
    ])
  }
  return (
    <RootStoreContext.Provider value={storeRef.current}>
      {children}
    </RootStoreContext.Provider>
  )
}
