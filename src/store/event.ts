import { Instance, types } from 'mobx-state-tree'
import { ResourceModel } from './resource'

export const EventModel = types
  .model({
    id: types.identifier,
    updatedAt: types.Date,
    start: types.Date,
    end: types.Date,
    label: types.string,
    color: types.string,
    tentative: types.boolean,
    resource: types.reference(ResourceModel),
  })
  .actions((self) => ({
    changeDates(start: Date, end: Date) {
      self.updatedAt = new Date()
      self.start = start
      self.end = end
    },
    updateLabel(str: string) {
      self.updatedAt = new Date()
      self.label = str
    },
    setTentative(tentative: boolean) {
      self.updatedAt = new Date()
      self.tentative = tentative
    },
  }))
export type IEventModel = Instance<typeof EventModel>
