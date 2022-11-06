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
      setResources(
        resources: Array<SnapshotOrInstance<typeof ResourceModel>>,
        ignoreTimestamp = false
      ) {
        resources.forEach((resource) => {
          const entity = self.resources.get(resource.id)

          if (
            ignoreTimestamp ||
            !entity ||
            resource.serverUpdatedAt > entity.serverUpdatedAt
          ) {
            self.resources.set(resource.id, cast(resource))
          }
        })
      },
      setEvents(
        events: Array<SnapshotOrInstance<typeof EventModel>>,
        ignoreTimestamp = false
      ) {
        events.forEach((event) => {
          const entity = self.events.get(event.id)

          if (
            ignoreTimestamp ||
            !entity ||
            event.serverUpdatedAt > entity.serverUpdatedAt
          ) {
            self.events.set(event.id, cast(event))
          }
        })
      },
      createEvent(resourceId: string, label: string, start: Date, end: Date) {
        const resource = self.resources.get(resourceId)
        if (!resource) {
          console.error('Resource not found with id', resourceId)
          return
        }
        const event = EventModel.create({
          id: uuidv4(),
          updatedAt: new Date(),
          serverUpdatedAt: 0,
          tentative: false,
          color: 'grey',
          label,
          start,
          end,
        })
        self.events.put(event)
        resource.addEvent(event.id)
      },
    }
  })

export type IRootStoreModel = Instance<typeof RootStoreModel>
