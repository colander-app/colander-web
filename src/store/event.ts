import { Instance, types } from 'mobx-state-tree'

export const EventModel = types
  .model({
    id: types.identifier,
    updatedAt: types.string,
    start_date: types.string,
    end_date: types.string,
    label: types.string,
    color: types.string,
    tentative: types.boolean,
    resource_id: types.string,
  })
  .actions((self) => ({
    changeDates(start: string, end: string) {
      self.updatedAt = new Date().toISOString()
      self.start_date = start
      self.end_date = end
    },
    updateLabel(str: string) {
      self.updatedAt = new Date().toISOString()
      self.label = str
    },
    setTentative(tentative: boolean) {
      self.updatedAt = new Date().toISOString()
      self.tentative = tentative
    },
  }))
export type IEventModel = Instance<typeof EventModel>
