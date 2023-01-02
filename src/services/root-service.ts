import { EventModel } from '../store/event'
import { ResourceModel } from '../store/resource'
import { makeWebsocketService } from './websocket'
import { UploadModel } from '../store/upload'
import { makeUploadService } from './upload-service'
import { ProjectModel } from '../store/project'
import { makeModelService } from './model'
import { Queries } from './query-interfaces'
import config from '../config.json'
import {
  subscribeToEventRange,
  subscribeToOrg,
  unsubscribeFromEventRange,
} from './requests'

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

  const uploads = makeModelService(UploadModel, {
    putItem: (data) => ws.sendMessage({ action: 'putUpload', data }),
    subscribeUpstream: ws.subscribe,
  })

  const uploadService = makeUploadService({
    onNewUpload(id, filename, size, content_type, resource_id, event_id) {
      console.log('Adding upload to store', filename, size)
      uploads.store.set([
        {
          __type: 'upload',
          updated_at: new Date().toISOString(),
          status: 'uploading',
          uploader: 'user1',
          read_link: undefined,
          expire_at: undefined,
          upload_id: undefined,
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

  const subscribe = (query: Queries): (() => void) => {
    if (query.type === 'subscribeToEventRange') {
      ws.sendMessage(subscribeToEventRange(query))
      return () => {
        ws.sendMessage(unsubscribeFromEventRange(query.resourceIds))
      }
    }
    if (query.type === 'subscribeToOrganization') {
      ws.sendMessage(subscribeToOrg(query))
      return () => {
        ws.sendMessage({ action: 'unsubscribeFromOrganization', query })
      }
    }
    return function emptyUnsubscribe() {}
  }

  return {
    uploadService,
    subscribe,
    subscribeStatus: ws.subscribeStatus,
    projects,
    events,
    resources,
    uploads,
  }
}
