import { autorun } from 'mobx'
import { SnapshotOut, getSnapshot, SnapshotIn } from 'mobx-state-tree'
import { EventModel } from '../store/event'
import { ResourceModel } from '../store/resource'
import { RootStoreModel, IRootStoreModel } from '../store/root'
import { makeUpdaterQueue } from './updater-queue'
import { Queries } from './live-model/query-interfaces'
import config from '../config.json'
import { makeWebsocketService } from './websocket'
import {
  subscribeToEventRange,
  unsubscribeFromEventRange,
} from '../requests/events'
import { UploadModel } from '../store/upload'
import { makeUploadService, UploadService } from './upload-service'

export interface RootService {
  store: IRootStoreModel
  uploadService: UploadService
  subscribe: (q: Queries) => () => void
}

const API_THROTTLE_RATE_MS = 500

const seedResources: SnapshotIn<typeof ResourceModel>[] = [
  {
    __type: 'resource',
    id: 'r1',
    name: 'Resource 1',
    organization_id: 'org1',
    updated_at: new Date(1667309346394).toISOString(),
  },
  {
    __type: 'resource',
    id: 'r2',
    name: 'Resource 2',
    organization_id: 'org1',
    updated_at: new Date(1667309350406).toISOString(),
  },
  {
    __type: 'resource',
    id: 'r3',
    name: 'Resource 3',
    organization_id: 'org1',
    updated_at: new Date(1667309350406).toISOString(),
  },
  {
    __type: 'resource',
    id: 'r4',
    name: 'Resource 4',
    organization_id: 'org1',
    updated_at: new Date(1667309350406).toISOString(),
  },
]

export const makeRootService = (): RootService => {
  const serverStore = RootStoreModel.create()
  const store = RootStoreModel.create()

  // FAKE _SEED_
  serverStore.set(seedResources)
  store.set(seedResources)

  const { sendMessage } = makeWebsocketService({
    endpoint: config.wsEndpoint,
    onMessage(items) {
      console.log('server items received:', items)
      serverStore.set(items)
      store.set(items)
    },
  })

  const queueResourceUpdates = makeUpdaterQueue<
    SnapshotOut<typeof ResourceModel>
  >({
    throttleRateMs: API_THROTTLE_RATE_MS,
    update: async (model) => {
      sendMessage({ action: 'putResource', data: model })
    },
    onUpdateFailed(model) {
      const serverEntity = serverStore.resources.get(model.id)
      if (serverEntity) {
        store.set([serverEntity])
      }
    },
  })

  const queueEventUpdates = makeUpdaterQueue<SnapshotOut<typeof EventModel>>({
    throttleRateMs: API_THROTTLE_RATE_MS,
    async update(model) {
      sendMessage({ action: 'putEvent', data: model })
    },
    onUpdateFailed(model) {
      const serverEntity = serverStore.events.get(model.id)
      if (serverEntity) {
        store.set([serverEntity])
      }
    },
  })

  const queueUploadUpdates = makeUpdaterQueue<SnapshotOut<typeof UploadModel>>({
    throttleRateMs: API_THROTTLE_RATE_MS,
    async update(model) {
      sendMessage({ action: 'putUpload', data: model })
    },
    onUpdateFailed(model) {
      const serverEntity = serverStore.uploads.get(model.id)
      if (serverEntity) {
        store.set([serverEntity])
      }
    },
  })

  autorun(() => {
    const resources = Object.values(getSnapshot(store.resources))
    const modifiedResources = resources.filter(
      ({ id, updated_at }) =>
        new Date(updated_at) >
        new Date(serverStore.resources.get(id)?.updated_at ?? 0)
    )
    queueResourceUpdates(modifiedResources)
  })

  autorun(() => {
    const events = Object.values(getSnapshot(store.events))
    const modifiedEvents = events.filter(
      ({ id, updated_at }) =>
        new Date(updated_at) >
        new Date(serverStore.events.get(id)?.updated_at ?? 0)
    )
    queueEventUpdates(modifiedEvents)
  })

  const subscribe = (query: Queries): (() => void) => {
    if (query.type === 'subscribeToEventRange') {
      sendMessage(subscribeToEventRange(query))
      return () => {
        sendMessage(unsubscribeFromEventRange(query.resourceIds))
      }
    }
    return function emptyUnsubscribe() {}
  }

  const uploadService = makeUploadService({
    onNewUpload(id, filename, size, content_type, resource_id, event_id) {
      console.log(
        'Adding upload to store',
        id,
        filename,
        size,
        resource_id,
        event_id
      )
      store.createUpload({
        __type: 'upload',
        status: 'uploading',
        uploader: 'me',
        id,
        resource_id,
        event_id,
        filename,
        size,
        content_type,
        read_link: undefined,
      })
    },
    onPartUploaded(upload_id, part, etag) {
      console.log('Completed uploading part!', upload_id, part, etag)
      const upload = store.uploads.get(upload_id)
      if (upload) {
        upload.completePart(part, etag)
      }
    },
  })

  autorun(() => {
    const uploads = Object.values(getSnapshot(store.uploads))
    const locallyModifiedUploads = uploads.filter(
      ({ id, updated_at }) =>
        new Date(updated_at) >
        new Date(serverStore.uploads.get(id)?.updated_at ?? 0)
    )
    const serverModifiedUploads = uploads.filter(
      (upload) => !locallyModifiedUploads.find((u) => u.id === upload.id)
    )
    uploadService.onUploadsModified(serverModifiedUploads)
    queueUploadUpdates(locallyModifiedUploads)
  })

  return {
    store,
    uploadService,
    subscribe,
  }
}
