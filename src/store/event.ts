import { Instance, types } from 'mobx-state-tree'

export const EventModel = types
  .model({
    id: types.identifier,
    updatedAt: types.Date,
    serverUpdatedAt: types.Date,
    start: types.Date,
    end: types.Date,
    label: types.string,
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
  }))
export type IEventModel = Instance<typeof EventModel>
