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
    updatedAt: new Date(1667309346394).toISOString(),
  },
  {
    id: 'r2',
    name: 'Resource 2',
    updatedAt: new Date(1667309350406).toISOString(),
  },
  {
    id: 'r3',
    name: 'Resource 3',
    updatedAt: new Date(1667309350406).toISOString(),
  },
  {
    id: 'r4',
    name: 'Resource 4',
    updatedAt: new Date(1667309350406).toISOString(),
  },
]

export const makeRootService = (): RootService => {
  const serverStore = RootStoreModel.create()
  const store = RootStoreModel.create()

  // FAKE _SEED_
  serverStore.setResources(seedResources)
  store.setResources(seedResources)

  // WEBSOCKET INITIAL SPAGHETTI
  let isOpened = false
  const ws = new WebSocket(
    'wss://37lcz5pey2.execute-api.us-east-1.amazonaws.com/dev'
  )
  let messageQueue: string[] = []
  const sendMessage = (data: string) => {
    if (isOpened) {
      console.log('sending message', data)
      ws.send(data)
    } else {
      console.log('queueing message', data)
      messageQueue.push(data)
    }
  }
  ws.addEventListener('message', (event) => {
    try {
      const events = JSON.parse(event.data)
      serverStore.setEvents(events)
      store.setEvents(events)
      console.log('inbound events', events)
    } catch (err) {
      console.log('err', event.data)
    }
  })
  ws.addEventListener('open', () => {
    isOpened = true
    console.log('Socket open!')
    messageQueue.forEach((msg) => {
      console.log('dequeueing message', msg)
      ws.send(msg)
    })
    messageQueue = []
  })
  ws.addEventListener('close', () => {
    isOpened = false
    console.log('Socket close :(')
  })

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
      ({ id, updatedAt }) =>
        new Date(updatedAt) >
        new Date(serverStore.resources.get(id)?.updatedAt ?? 0)
    )
    queueResourceUpdates(modifiedResources)
  })

  autorun(() => {
    const events = Object.values(getSnapshot(store.events))
    const modifiedEvents = events.filter(
      ({ id, updatedAt }) =>
        new Date(updatedAt) >
        new Date(serverStore.events.get(id)?.updatedAt ?? 0)
    )
    queueEventUpdates(modifiedEvents)
  })

  const subscribe = (query: Queries): (() => void) => {
    if (query.type === 'QueryEventWindow') {
      query.resourceIds.map((resource_id) => {
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
        }
      })
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
