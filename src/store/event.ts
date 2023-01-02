import { Instance, types } from 'mobx-state-tree'

export const EventModel = types
  .model('Event', {
    __type: types.optional(types.literal('event'), 'event'),
    id: types.identifier,
    resource_id: types.string,
    project_id: types.maybe(types.string),
    start_date: types.string,
    end_date: types.string,
    label: types.string,
    color: types.string,
    tentative: types.boolean,
    updated_at: types.string,
  })
  .actions((self) => ({
    changeDates(start: string, end: string) {
      self.updated_at = new Date().toISOString()
      self.start_date = start
      self.end_date = end
    },
    updateLabel(str: string) {
      self.updated_at = new Date().toISOString()
      self.label = str
    },
    updateColor(color: string) {
      self.updated_at = new Date().toISOString()
      self.color = color
    },
    setTentative(tentative: boolean) {
      self.updated_at = new Date().toISOString()
      self.tentative = tentative
    },
  }))
export type IEventModel = Instance<typeof EventModel>
