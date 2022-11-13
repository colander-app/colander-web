import { autorun } from 'mobx'
import { SnapshotOut, getSnapshot } from 'mobx-state-tree'
import { EventModel } from '../store/event'
import { IResourceModel, ResourceModel } from '../store/resource'
import { RootStoreModel, IRootStoreModel } from '../store/root'
import { makeUpdaterQueue } from './updater-queue'
import { Queries } from './live-model/query-interfaces'

export interface RootService {
  store: IRootStoreModel
  subscribe: (q: Queries) => () => void
}

export const makeRootService = (): RootService => {
  const serverStore = RootStoreModel.create()
  const store = RootStoreModel.create()

  const queueResourceUpdates = makeUpdaterQueue<
    SnapshotOut<typeof ResourceModel>
  >({
    update: async (model) => {
      const serverEntity = serverStore.resources.get(model.id)
      // await DataStore.save(
      //   serverEntity
      //     ? Resource.copyOf(getSnapshot(serverEntity), () => model)
      //     : new Resource(model)
      // )
    },
    onUpdateFailed(model) {
      const serverEntity = serverStore.resources.get(model.id)
      if (serverEntity) {
        store.setResources([serverEntity])
      }
    },
  })

  const queueEventUpdates = makeUpdaterQueue<SnapshotOut<typeof EventModel>>({
    update: async (model) => {
      const serverEntity = serverStore.events.get(model.id)
      // await DataStore.save(
      //   serverEntity
      //     ? Event.copyOf(getSnapshot(serverEntity), () => model)
      //     : new Event({ ...model, resource: { id: model.resource } })
      // )
    },
    onUpdateFailed(model) {
      const serverEntity = serverStore.events.get(model.id)
      if (serverEntity) {
        store.setEvents([serverEntity])
      }
    },
  })

  autorun(() => {
    const resources = Object.values(getSnapshot(store.resources))
    const modifiedResources = resources.filter(
      ({ id, updatedAt }) =>
        updatedAt > (serverStore.resources.get(id)?.updatedAt ?? 0)
    )
    queueResourceUpdates(modifiedResources)
  })

  autorun(() => {
    const events = Object.values(getSnapshot(store.events))
    const modifiedEvents = events.filter(
      ({ id, updatedAt }) =>
        updatedAt > (serverStore.events.get(id)?.updatedAt ?? 0)
    )
    queueEventUpdates(modifiedEvents)
  })

  const subscribe = (query: Queries): (() => void) => {
    if (query.type === 'QueryEventWindow') {
      // const subscriptions = query.resourceIds.map((id) =>
      //   DataStore.observeQuery(Event, (e) =>
      //     e
      //       .eventResourceId('eq', id)
      //       .or((e) =>
      //         e
      //           .start('le', query.viewEnd.getTime())
      //           .end('ge', query.viewStart.getTime())
      //       )
      //   ).subscribe((snapshot) => {
      //     // @ts-expect-error EagerEvent from DataStore differs from EventModel MST model
      //     store.setEvents(snapshot.items)
      //     // @ts-expect-error EagerEvent from DataStore differs from EventModel MST model
      //     serverStore.setEvents(snapshot.items)
      //   })
      // )
      // return () =>
      //   subscriptions.forEach((subscription) => subscription.unsubscribe())
    }
    return () => {}
  }

  return {
    store,
    subscribe,
  }
}
