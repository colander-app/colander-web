import { EventModel } from '../store/event'
import { ResourceModel } from '../store/resource'
import { makeWebsocketService } from './websocket'
import { UploadModel } from '../store/upload'
import { makeUploadService } from './upload-service'
import { ProjectModel } from '../store/project'
import { makeModelStore } from './model-store'
import { Queries } from './query-interfaces'
import config from '../config.json'
import {
  completeMagicLogin,
  initMagicLogin,
  subscribeToEventRange,
  subscribeToOrg,
  unsubscribeFromEventRange,
} from './requests'
import { TokenModel } from '../store/token'

export const makeRootService = () => {
  const ws = makeWebsocketService({
    endpoint: config.wsEndpoint,
  })

  const authWs = makeWebsocketService({
    endpoint: config.wsAuthEndpoint,
  })

  authWs.subscribe((msg) => {
    if (TokenModel.is(msg)) {
      // use access token to authenticate appWs
      // store refresh token in localStorage
    }
  })

  const loginWithCode = (email: string) => {
    authWs.sendMessage(initMagicLogin(email))
  }

  const completeLoginWithCode = (email: string, code: string) => {
    authWs.sendMessage(completeMagicLogin(email, code))
  }

  /**
   * Logic::: auth endpoint used for authenticating user until a token is received.
   *
   *  Authentication flow (magic link grant type):
   *  - > connect to auth websocket
   *  - > send authenticate request with email
   *  - < create auth code for email, send code to email
   *  - > send get token request with email and code
   *  - < validate code, create access token / refresh token pair, new token family. immediately send to WS
   *  - > app stores access token in memory and refresh token in localstorage
   *
   *  Authentication flow (refresh token grant type):
   *  - > connect to auth websocket
   *  - > send get token request with refresh token
   *  - < validate refresh token, create new access token / refresh token pair in family. immediately send to WS
   *  - > app stores access token in memory and refresh token in localstorage
   *
   *  Authorization flow:
   *  - > connect to app websocket with access token in querystring
   *  - < lambda authorizer validates access token, returns valid iam policy to access endpoints
   *  - > app websocket is now connected and data can flow
   *
   */

  const projects = makeModelStore(ProjectModel, {
    putItem: (data) => ws.sendMessage({ action: 'putProject', data }),
    subscribeUpstream: ws.subscribe,
  })

  const events = makeModelStore(EventModel, {
    putItem: (data) => ws.sendMessage({ action: 'putEvent', data }),
    subscribeUpstream: ws.subscribe,
  })

  const resources = makeModelStore(ResourceModel, {
    putItem: (data) => ws.sendMessage({ action: 'putResource', data }),
    subscribeUpstream: ws.subscribe,
  })

  const uploads = makeModelStore(UploadModel, {
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
