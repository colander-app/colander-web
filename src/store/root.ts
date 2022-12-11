import { v4 as uuidv4 } from 'uuid'
import {
  types,
  Instance,
  SnapshotOrInstance,
  cast,
  SnapshotOut,
} from 'mobx-state-tree'
import { EventModel } from './event'
import { ResourceModel } from './resource'
import { UploadModel } from './upload'

type AllModels =
  | SnapshotOrInstance<typeof EventModel>
  | SnapshotOrInstance<typeof ResourceModel>
  | SnapshotOrInstance<typeof UploadModel>

export const RootStoreModel = types
  .model({
    resources: types.map(ResourceModel),
    events: types.map(EventModel),
    uploads: types.map(UploadModel),
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
      set(items: Array<AllModels>) {
        items.forEach((item) => {
          switch (item.__type) {
            case 'event':
              self.events.set(item.id, cast(item))
              return
            case 'resource':
              self.resources.set(item.id, cast(item))
              return
            case 'upload':
              self.uploads.set(item.id, cast(item))
              return
            default:
              console.warn(
                `Cannot place unknown model type ${item.__type} in root store.`,
                item
              )
          }
        })
      },
      createUpload(
        uploadInput: Omit<
          SnapshotOut<typeof UploadModel>,
          'id' | 'updated_at' | 'upload_id' | 'parts' | 'expire_at'
        >
      ) {
        self.uploads.put({
          id: uuidv4(),
          updated_at: new Date().toISOString(),
          ...uploadInput,
        })
      },
      createEvent(resource_id: string, label: string, start: Date, end: Date) {
        const resource = self.resources.get(resource_id)
        if (!resource) {
          console.error('Resource not found with id', resource_id)
          return
        }
        self.events.put({
          id: uuidv4(),
          updated_at: new Date().toISOString(),
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          tentative: false,
          color: '#CCC',
          label,
          resource_id,
        })
      },
    }
  })

export type IRootStoreModel = Instance<typeof RootStoreModel>
