import { types, Instance } from 'mobx-state-tree'

export const Event = types
  .model({
    id: types.identifier,
    start: types.Date,
    end: types.Date,
    label: types.string,
  })
  .actions((self) => ({
    changeDate(newStart: Date, newEnd: Date) {
      self.start = newStart
      self.end = newEnd
    },
  }))
export type IEvent = Instance<typeof Event>

export const Resource = types
  .model({
    id: types.identifier,
    name: types.string,
    events: types.array(Event),
  })
  .actions((self) => ({
    addEvent(event: IEvent) {
      self.events.push(event)
    },
  }))
export type IResource = Instance<typeof Resource>

const RootStore = types
  .model({
    resources: types.array(Resource),
  })
  .actions((self) => ({
    replaceResources(resources: IResource[]) {
      self.resources.clear()
      self.resources.push(...resources)
    },
  }))

export const createRootStore = () => {
  return RootStore.create()
}
