import { autorun } from 'mobx'
import {
  cast,
  getSnapshot,
  IModelType,
  ISimpleType,
  SnapshotIn,
  SnapshotOrInstance,
  SnapshotOut,
  types,
  _NotCustomized,
} from 'mobx-state-tree'
import { makeUpdaterQueue } from './updater-queue'

const API_THROTTLE_RATE_MS = 500

interface Dependencies<T> {
  putItem: (item: T) => void
  subscribeUpstream: (cb: (item: unknown[]) => void) => () => void
}

type Subscriber<T> = (items: SnapshotOut<T>[]) => void

interface BaseModelType
  extends IModelType<
    { id: ISimpleType<string>; updated_at: ISimpleType<string> },
    {},
    _NotCustomized,
    _NotCustomized
  > {}

export const makeModelService = <T extends BaseModelType>(
  model: T,
  { putItem, subscribeUpstream }: Dependencies<T>
) => {
  const subscribers = new Set<Subscriber<T>>()

  // Consumers can subscribe to changes in model items
  const subscribe = (fn: Subscriber<T>) => {
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  }

  // Define a model to store and update items
  const ModelStore = types
    .model({ items: types.map(model) })
    .actions((self) => ({
      set(items: SnapshotOrInstance<T>[]) {
        items.forEach((item) => self.items.set(item.id, cast(item)))
      },
    }))

  // Create an instance for server records and one for local records
  const serverStore = ModelStore.create()
  const store = ModelStore.create()

  // Subscribe to upstream data
  subscribeUpstream((items) => {
    const upstreamItems = items.filter((item) => model.is(item))
    if (upstreamItems.length > 0) {
      console.log('got items upstream!', model.name, upstreamItems)
      serverStore.set(upstreamItems as SnapshotIn<typeof model>[])
      store.set(upstreamItems as SnapshotIn<typeof model>[])
    }
  })

  // Define a throttled update queue to put items upstream
  const queueUpdates = makeUpdaterQueue<SnapshotOut<typeof model>>({
    throttleRateMs: API_THROTTLE_RATE_MS,
    update: async (item) => putItem(item),
    onUpdateFailed(model) {
      const serverEntity = serverStore.items.get(model.id)
      if (serverEntity) {
        store.set([serverEntity as SnapshotOrInstance<typeof model>])
      }
    },
  })

  // Observe changes to the store and queue updates to new items
  autorun(() => {
    const localItems = Object.values(getSnapshot(store.items)) as SnapshotOut<
      typeof model
    >[]
    subscribers.forEach((subscriber) => subscriber(localItems))
    const localModifiedItems = localItems.filter(
      ({ id, updated_at }) =>
        new Date(updated_at) >
        new Date(serverStore.items.get(id)?.updated_at ?? 0)
    )
    if (localModifiedItems.length > 0) {
      queueUpdates(localModifiedItems)
    }
  })

  return { store, subscribe }
}
