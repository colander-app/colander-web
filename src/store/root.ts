import { v4 as uuidv4 } from 'uuid'
import { types, Instance, SnapshotOrInstance, cast } from 'mobx-state-tree'
import { EventModel } from './event'
import { ResourceModel } from './resource'

export const RootStoreModel = types
  .model({
    resources: types.map(ResourceModel),
    events: types.map(EventModel),
  })
  .views((self) => ({
    getResources(ids: string[]) {
      return ids
        .map((id) => self.resources.get(id))
        .filter(Boolean) as Instance<typeof ResourceModel>[]
    },
    getEvents(ids: string[]) {
      return ids.map((id) => self.events.get(id)).filter(Boolean) as Instance<
        typeof EventModel
      >[]
    },
  }))
  .actions((self) => {
    return {
      setResources(resources: Array<SnapshotOrInstance<typeof ResourceModel>>) {
        resources.forEach((resource) => {
          self.resources.set(resource.id, cast(resource))
        })
      },
      setEvents(events: Array<SnapshotOrInstance<typeof EventModel>>) {
        events.forEach((event) => {
          self.events.set(event.id, cast(event))
        })
      },
      createEvent(resource_id: string, label: string, start: Date, end: Date) {
        const resource = self.resources.get(resource_id)
        if (!resource) {
          console.error('Resource not found with id', resource_id)
          return
        }
        const event = EventModel.create({
          id: uuidv4(),
          updatedAt: new Date().toISOString(),
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          tentative: false,
          color: 'grey',
          label,
          resource_id,
        })
        self.events.put(event)
      },
    }
  })

export type IRootStoreModel = Instance<typeof RootStoreModel>
