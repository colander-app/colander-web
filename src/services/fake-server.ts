import { SnapshotIn } from 'mobx-state-tree'
import moment from 'moment'
import { EventModel } from '../store/event'
import { ResourceModel } from '../store/resource'
import { DataService } from './live-model'

/**
 * FAKE FOR TESTING WIRING OF DATA LAYER
 */
const resources: SnapshotIn<typeof ResourceModel>[] = [
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
const events: SnapshotIn<typeof EventModel>[] = [
  {
    id: 'e1',
    label: 'Fake Co. #344',
    start_date: moment().add(3, 'days').toISOString(),
    end_date: moment().add(8, 'days').toISOString(),
    updatedAt: new Date(1667309346394).toISOString(),
    tentative: false,
    color: 'rgb(182, 182, 182)',
    resource_id: 'r1',
  },
  {
    id: 'e2',
    label: 'Fake Co. #100',
    start_date: moment().add(5, 'days').toISOString(),
    end_date: moment().add(10, 'days').toISOString(),
    updatedAt: new Date(1667309348524).toISOString(),
    tentative: true,
    color: 'rgb(182, 182, 182)',
    resource_id: 'r2',
  },
  {
    id: 'e3',
    label: 'Walmart #2440',
    start_date: moment().add(7, 'days').toISOString(),
    end_date: moment().add(13, 'days').toISOString(),
    updatedAt: new Date(1667309350406).toISOString(),
    tentative: false,
    color: 'rgb(182, 182, 182)',
    resource_id: 'r3',
  },
  {
    id: 'e4',
    label: 'Target #23',
    start_date: moment().add(15, 'days').toISOString(),
    end_date: moment().add(18, 'days').toISOString(),
    updatedAt: new Date(1667309351458).toISOString(),
    tentative: false,
    color: 'rgb(182, 182, 182)',
    resource_id: 'r4',
  },
]

export const fakeWebsocket = () => {
  const callbacks = new Set()

  const connect: DataService = (endpoint, query, callback) => {
    console.log('Connecting to websocket with query', query)
    callbacks.add(callback)

    // send initial data set upon connection
    console.log('sending events', events)
    callback('Event', events)
    console.log('sending resources', resources)
    callback('Resource', resources)

    return () => {
      console.log('Disconnecting from websocekt query', query)
      callbacks.delete(callback)
    }
  }

  const update = (type: string, model: any) => {
    console.log(
      `==== SERVER ====\n Updating resource: ${type} -> ${JSON.stringify(
        model,
        null,
        '\t'
      )}\n==== SERVER ====`
    )
    if (type === 'Event') {
      const idx = events.findIndex((e) => e.id === model.id)
      if (idx === -1) {
        events.push(model)
      } else {
        events.splice(idx, 1, model)
      }
    }

    if (type === 'Resource') {
      const idx = resources.findIndex((r) => r.id === model.id)
      if (idx === -1) {
        resources.push(model)
      } else {
        resources.splice(idx, 1, model)
      }
    }

    callbacks.forEach((cb: any) => cb(type, [model]))
  }
  return { connect, update }
}
