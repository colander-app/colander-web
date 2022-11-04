import { autorun } from 'mobx'
import { SnapshotIn, SnapshotOut, getSnapshot } from 'mobx-state-tree'
import { EventModel } from '../store/event'
import { ResourceModel } from '../store/resource'
import { RootStoreModel, IRootStoreModel } from '../store/root'
import { LiveModelService, makeLiveModelService } from './live-model'
import { makeUpdaterQueue } from './updater-queue'
// FAKE
import { fakeWebsocket } from './fake-server'

export interface RootService {
  store: IRootStoreModel
  liveData: LiveModelService
}

// FAKE
const WS_ENDPOINT = 'wss://snoapps.com/socket.io'

export const makeRootService = (): RootService => {
  const serverStore = RootStoreModel.create()
  const store = RootStoreModel.create()

  // FAKE
  const websocket = fakeWebsocket()

  const queueResourceUpdates = makeUpdaterQueue<
    SnapshotOut<typeof ResourceModel>
  >({
    update: async (model) => {
      // FAKE
      websocket.update('Resource', model)
    },
    onUpdateFailed(model) {
      const serverEntity = serverStore.resources.get(model.id)
      if (serverEntity) {
        store.setResources([serverEntity], true)
      }
    },
  })

  const queueEventUpdates = makeUpdaterQueue<SnapshotOut<typeof EventModel>>({
    update: async (model) => {
      // FAKE
      websocket.update('Event', model)
    },
    onUpdateFailed(model) {
      const serverEntity = serverStore.events.get(model.id)
      if (serverEntity) {
        store.setEvents([serverEntity], true)
      }
    },
  })

  autorun(() => {
    const resources = Object.values(getSnapshot(store.resources))
    const modifiedResources = resources.filter(
      ({ serverUpdatedAt, updatedAt }) => updatedAt > serverUpdatedAt
    )
    queueResourceUpdates(modifiedResources)
  })

  autorun(() => {
    const events = Object.values(getSnapshot(store.events))
    const modifiedEvents = events.filter(
      ({ serverUpdatedAt, updatedAt }) => updatedAt > serverUpdatedAt
    )
    queueEventUpdates(modifiedEvents)
  })

  const liveData = makeLiveModelService({
    endpoint: WS_ENDPOINT,
    onUpdate(channel, models) {
      console.log('Live data update:', channel, models)
      if (channel === 'Resource') {
        const resources = models as SnapshotIn<typeof ResourceModel>[]
        store.setResources(resources)
        serverStore.setResources(resources)
      }
      if (channel === 'Event') {
        const events = models as SnapshotIn<typeof EventModel>[]
        store.setEvents(events)
        serverStore.setEvents(events)
      }
    },
    connect(url, params, cb) {
      // FAKE
      return websocket.connect(url, params, cb)
    },
  })

  return {
    store,
    liveData,
  }
}
