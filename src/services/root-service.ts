import { autorun } from 'mobx'
import { SnapshotOut, getSnapshot, SnapshotIn } from 'mobx-state-tree'
import { EventModel } from '../store/event'
import { ResourceModel } from '../store/resource'
import { RootStoreModel, IRootStoreModel } from '../store/root'
import { makeUpdaterQueue } from './updater-queue'
import { Queries } from './live-model/query-interfaces'
import config from '../config.json'
import { makeWebsocketService } from './websocket'
import {
  subscribeToEventRange,
  unsubscribeFromEventRange,
} from '../requests/events'

export interface RootService {
  store: IRootStoreModel
  subscribe: (q: Queries) => () => void
}

const API_THROTTLE_RATE_MS = 500

const seedResources: SnapshotIn<typeof ResourceModel>[] = [
  {
    id: 'r1',
    name: 'Resource 1',
    organization_id: 'org1',
    updated_at: new Date(1667309346394).toISOString(),
  },
  {
    id: 'r2',
    name: 'Resource 2',
    organization_id: 'org1',
    updated_at: new Date(1667309350406).toISOString(),
  },
  {
    id: 'r3',
    name: 'Resource 3',
    organization_id: 'org1',
    updated_at: new Date(1667309350406).toISOString(),
  },
  {
    id: 'r4',
    name: 'Resource 4',
    organization_id: 'org1',
    updated_at: new Date(1667309350406).toISOString(),
  },
]

export const makeRootService = (): RootService => {
  const serverStore = RootStoreModel.create()
  const store = RootStoreModel.create()

  // FAKE _SEED_
  serverStore.setResources(seedResources)
  store.setResources(seedResources)

  const { sendMessage } = makeWebsocketService({
    endpoint: config.wsEndpoint,
    onMessage(events) {
      console.log('inbound events', events)
      serverStore.setEvents(events)
      store.setEvents(events)
      console.log('event store updated')
    },
  })

  const queueResourceUpdates = makeUpdaterQueue<
    SnapshotOut<typeof ResourceModel>
  >({
    throttleRateMs: API_THROTTLE_RATE_MS,
    update: async (model) => {
      sendMessage({ action: 'putResource', data: model })
    },
    onUpdateFailed(model) {
      const serverEntity = serverStore.resources.get(model.id)
      if (serverEntity) {
        store.setResources([serverEntity])
      }
    },
  })

  const queueEventUpdates = makeUpdaterQueue<SnapshotOut<typeof EventModel>>({
    throttleRateMs: API_THROTTLE_RATE_MS,
    update: async (model) => {
      sendMessage({ action: 'putEvent', data: model })
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
      ({ id, updated_at }) =>
        new Date(updated_at) >
        new Date(serverStore.resources.get(id)?.updated_at ?? 0)
    )
    queueResourceUpdates(modifiedResources)
  })

  autorun(() => {
    const events = Object.values(getSnapshot(store.events))
    const modifiedEvents = events.filter(
      ({ id, updated_at }) =>
        new Date(updated_at) >
        new Date(serverStore.events.get(id)?.updated_at ?? 0)
    )
    queueEventUpdates(modifiedEvents)
  })

  const subscribe = (query: Queries): (() => void) => {
    if (query.type === 'subscribeToEventRange') {
      sendMessage(subscribeToEventRange(query))
      return () => {
        sendMessage(unsubscribeFromEventRange(query.resourceIds))
      }
    }
    return () => {}
  }

  return {
    store,
    subscribe,
  }
}
