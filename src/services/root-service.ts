import { autorun } from 'mobx'
import { SnapshotOut, getSnapshot, SnapshotIn } from 'mobx-state-tree'
import { EventModel } from '../store/event'
import { ResourceModel } from '../store/resource'
import { RootStoreModel, IRootStoreModel } from '../store/root'
import { makeUpdaterQueue } from './updater-queue'
import { Queries } from './query-interfaces'
import config from '../config.json'
import { makeWebsocketService } from './websocket'
import {
  subscribeToEventRange,
  unsubscribeFromEventRange,
} from '../requests/events'
import { UploadModel } from '../store/upload'
import { makeUploadService, UploadService } from './upload-service'
import { ProjectModel } from '../store/project'
import { makeModelService } from './model'
import { v4 as uuidv4 } from 'uuid'

const API_THROTTLE_RATE_MS = 500

const seedResources: SnapshotIn<typeof ResourceModel>[] = [
  {
    __type: 'resource',
    id: 'r1',
    name: 'Suzan Sharp',
    organization_id: 'org1',
    updated_at: new Date(1667309346394).toISOString(),
  },
  {
    __type: 'resource',
    id: 'r2',
    name: 'Jonny Edwards',
    organization_id: 'org1',
    updated_at: new Date(1667309350406).toISOString(),
  },
  {
    __type: 'resource',
    id: 'r3',
    name: 'Georgina Franks',
    organization_id: 'org1',
    updated_at: new Date(1667309350406).toISOString(),
  },
  {
    __type: 'resource',
    id: 'r4',
    name: 'Tal Francino',
    organization_id: 'org1',
    updated_at: new Date(1667309350406).toISOString(),
  },
]

export const makeRootService = () => {
  const ws = makeWebsocketService({ endpoint: config.wsEndpoint })

  const projects = makeModelService(ProjectModel, {
    putItem: (data) => ws.sendMessage({ action: 'putProject', data }),
    subscribeUpstream: ws.subscribe,
  })

  const events = makeModelService(EventModel, {
    putItem: (data) => ws.sendMessage({ action: 'putEvent', data }),
    subscribeUpstream: ws.subscribe,
  })

  const resources = makeModelService(ResourceModel, {
    putItem: (data) => ws.sendMessage({ action: 'putResource', data }),
    subscribeUpstream: ws.subscribe,
  })
  resources.store.set(seedResources)

  const uploads = makeModelService(UploadModel, {
    putItem: (data) => ws.sendMessage({ action: 'putUpload', data }),
    subscribeUpstream: ws.subscribe,
  })

  // const queueProjectUpdates = makeUpdaterQueue<
  //   SnapshotOut<typeof ProjectModel>
  // >({
  //   throttleRateMs: API_THROTTLE_RATE_MS,
  //   update: async (model) => {
  //     sendMessage({ action: 'putProject', data: model })
  //   },
  //   onUpdateFailed(model) {
  //     const serverEntity = serverStore.projects.get(model.id)
  //     if (serverEntity) {
  //       store.set([serverEntity])
  //     }
  //   },
  // })

  // const queueResourceUpdates = makeUpdaterQueue<
  //   SnapshotOut<typeof ResourceModel>
  // >({
  //   throttleRateMs: API_THROTTLE_RATE_MS,
  //   update: async (model) => {
  //     sendMessage({ action: 'putResource', data: model })
  //   },
  //   onUpdateFailed(model) {
  //     const serverEntity = serverStore.resources.get(model.id)
  //     if (serverEntity) {
  //       store.set([serverEntity])
  //     }
  //   },
  // })

  // const queueEventUpdates = makeUpdaterQueue<SnapshotOut<typeof EventModel>>({
  //   throttleRateMs: API_THROTTLE_RATE_MS,
  //   async update(model) {
  //     sendMessage({ action: 'putEvent', data: model })
  //   },
  //   onUpdateFailed(model) {
  //     const serverEntity = serverStore.events.get(model.id)
  //     if (serverEntity) {
  //       store.set([serverEntity])
  //     }
  //   },
  // })

  // const queueUploadUpdates = makeUpdaterQueue<SnapshotOut<typeof UploadModel>>({
  //   throttleRateMs: API_THROTTLE_RATE_MS,
  //   async update(model) {
  //     sendMessage({ action: 'putUpload', data: model })
  //   },
  //   onUpdateFailed(model) {
  //     const serverEntity = serverStore.uploads.get(model.id)
  //     if (serverEntity) {
  //       store.set([serverEntity])
  //     }
  //   },
  // })

  // autorun(() => {
  //   const projects = Object.values(getSnapshot(store.projects))
  //   const modifiedProjects = projects.filter(
  //     ({ id, updated_at }) =>
  //       new Date(updated_at) >
  //       new Date(serverStore.projects.get(id)?.updated_at ?? 0)
  //   )
  //   queueProjectUpdates(modifiedProjects)
  // })

  // autorun(() => {
  //   const resources = Object.values(getSnapshot(store.resources))
  //   const modifiedResources = resources.filter(
  //     ({ id, updated_at }) =>
  //       new Date(updated_at) >
  //       new Date(serverStore.resources.get(id)?.updated_at ?? 0)
  //   )
  //   queueResourceUpdates(modifiedResources)
  // })

  // autorun(() => {
  //   const events = Object.values(getSnapshot(store.events))
  //   const modifiedEvents = events.filter(
  //     ({ id, updated_at }) =>
  //       new Date(updated_at) >
  //       new Date(serverStore.events.get(id)?.updated_at ?? 0)
  //   )
  //   queueEventUpdates(modifiedEvents)
  // })

  const uploadService = makeUploadService({
    onNewUpload(id, filename, size, content_type, resource_id, event_id) {
      console.log('Adding upload to store', filename, size)
      uploads.store.set([
        {
          __type: 'upload',
          upload_id: uuidv4(),
          updated_at: new Date().toISOString(),
          status: 'uploading',
          uploader: 'me',
          read_link: undefined,
          expire_at: undefined,
          parts: undefined,
          id,
          resource_id,
          event_id,
          filename,
          size,
          content_type,
        },
      ])
    },
    onPartUploaded(upload_id, part, etag) {
      console.log('Completed uploading part!', upload_id, part, etag)
      const upload = uploads.store.items.get(upload_id)
      if (upload) {
        upload.completePart(part, etag)
      }
    },
  })
  uploads.subscribe((items) => uploadService.onUploadsModified(items))

  // autorun(() => {
  //   const uploads = Object.values(getSnapshot(store.uploads))
  //   const locallyModifiedUploads = uploads.filter(
  //     ({ id, updated_at }) =>
  //       new Date(updated_at) >
  //       new Date(serverStore.uploads.get(id)?.updated_at ?? 0)
  //   )
  //   const serverModifiedUploads = uploads.filter(
  //     (upload) => !locallyModifiedUploads.find((u) => u.id === upload.id)
  //   )
  //   uploadService.onUploadsModified(serverModifiedUploads)
  //   queueUploadUpdates(locallyModifiedUploads)
  // })

  const subscribe = (query: Queries): (() => void) => {
    if (query.type === 'subscribeToEventRange') {
      ws.sendMessage(subscribeToEventRange(query))
      return () => {
        ws.sendMessage(unsubscribeFromEventRange(query.resourceIds))
      }
    }
    return function emptyUnsubscribe() {}
  }

  return {
    uploadService,
    subscribe,
    projects,
    events,
    resources,
    uploads,
  }
}
