import { autorun } from 'mobx'
import { SnapshotOut, getSnapshot, SnapshotIn } from 'mobx-state-tree'
import { EventModel } from '../store/event'
import { ResourceModel } from '../store/resource'
import { RootStoreModel, IRootStoreModel } from '../store/root'
import { makeUpdaterQueue } from './updater-queue'
import { Queries } from './live-model/query-interfaces'

export interface RootService {
  store: IRootStoreModel
  subscribe: (q: Queries) => () => void
}

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

  let ws: WebSocket | undefined
  let messageQueue: string[] = []
  let isOpened = false
  const sendMessage = (data: string) => {
    if (isOpened) {
      console.log('sending message', data)
      ws?.send(data)
    } else {
      console.log('queueing message', data)
      messageQueue.push(data)
    }
  }
  const startWebsocket = () => {
    ws = new WebSocket(
      'wss://0h136ha5qk.execute-api.us-east-1.amazonaws.com/dev'
    )
    ws.addEventListener('message', (event) => {
      try {
        const events = JSON.parse(event.data)
        console.log('inbound events', events)
        serverStore.setEvents(events)
        store.setEvents(events)
        console.log('event store updated')
      } catch (err) {
        console.log('err', event.data)
      }
    })
    ws.addEventListener('open', () => {
      isOpened = true
      console.log('Socket open!')
      messageQueue.forEach((msg) => {
        console.log('dequeueing message', msg)
        ws?.send(msg)
      })
      messageQueue = []
    })
    ws.addEventListener('close', () => {
      isOpened = false
      ws = undefined
      console.log('Socket close :(')
      setTimeout(startWebsocket, 2000)
    })
  }
  startWebsocket()

  const queueResourceUpdates = makeUpdaterQueue<
    SnapshotOut<typeof ResourceModel>
  >({
    update: async (model) => {
      // const serverEntity = serverStore.resources.get(model.id)
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
      sendMessage(JSON.stringify({ action: 'putEvent', data: model }))
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
    if (query.type === 'QueryEventWindow') {
      const unsubscribers = query.resourceIds.map((resource_id) => {
        // subscribe to event range here.
        sendMessage(
          JSON.stringify({
            action: 'subscribeToEventRange',
            query: {
              resource_id,
              start_date: query.viewStart.toISOString(),
              end_date: query.viewEnd.toISOString(),
            },
          })
        )
        return () => {
          // unsubscribe from event range here.
          sendMessage(
            JSON.stringify({
              action: 'unsubscribeFromEventRange',
              data: {
                resource_id,
              },
            })
          )
        }
      })
      return () => {
        unsubscribers.forEach((unsubscribe) => unsubscribe())
      }
    }
    return () => {}
  }

  return {
    store,
    subscribe,
  }
}
