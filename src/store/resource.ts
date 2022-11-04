import { Instance, types } from 'mobx-state-tree'
import { EventModel } from './event'

export const ResourceModel = types
  .model({
    id: types.identifier,
    updatedAt: types.Date,
    serverUpdatedAt: types.Date,
    name: types.string,
    events: types.array(types.reference(EventModel)),
  })
  .actions((self) => ({
    addEvent(eventId: string) {
      self.events.push(eventId)
    },
  }))
export type IResourceModel = Instance<typeof ResourceModel>
