import ky, { KyResponse, Options } from 'ky'
import { v4 as uuidv4 } from 'uuid'
import { SnapshotOrInstance } from 'mobx-state-tree'
import { UploadModel } from '../store/upload'

const UPLOAD_RETRY_LIMIT = 3

export interface UploadService {
  initUpload: (file: File, resource_id: string, event_id: string) => void
  onUploadsModified: (
    uploads: Array<SnapshotOrInstance<typeof UploadModel>>
  ) => void
}

interface Dependencies {
  onNewUpload: (
    id: string,
    filename: string,
    size: number,
    content_type: string,
    resource_id: string,
    event_id: string
  ) => void
  onPartUploaded: (upload_id: string, part: number, etag: string) => void
}

const uploadFileSliceToUrl = (
  file: File,
  start: number,
  end: number,
  url: string
): Promise<KyResponse> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const upload_req_options: Options = {
        body: reader.result,
        throwHttpErrors: false,
        timeout: false,
        retry: {
          limit: UPLOAD_RETRY_LIMIT,
        },
      }
      try {
        const result = await ky.put(url, upload_req_options)
        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    const slice = file.slice(start, end)
    reader.readAsArrayBuffer(slice)
  })
}

const didUploadFail = (
  etag: string | null,
  response: KyResponse
): etag is null => {
  return !etag || response.status !== 200
}

export const makeUploadService = ({
  onNewUpload,
  onPartUploaded,
}: Dependencies): UploadService => {
  const files_by_id = new Map<string, File>()
  const uploads_in_progress = new Set<string>()

  const initUpload = (file: File, resource_id: string, event_id: string) => {
    const id = uuidv4()
    files_by_id.set(id, file)
    onNewUpload(id, file.name, file.size, file.type, resource_id, event_id)
  }

  const uploadPart = async (
    key: string,
    id: string,
    part: number,
    start: number,
    end: number,
    url: string
  ) => {
    const file = files_by_id.get(id)
    if (!file) {
      return
    }
    uploads_in_progress.add(key)
    const result = await uploadFileSliceToUrl(file, start, end, url)
    const etag = result.headers.get('ETag')
    if (didUploadFail(etag, result)) {
      console.warn('unable to upload part, we need retry logic.', {
        error: await result.text(),
        errorCode: result.status,
      })
    } else {
      onPartUploaded(id, part, etag)
    }
  }

  const onUploadsModified = (
    uploads: Array<SnapshotOrInstance<typeof UploadModel>>
  ) => {
    console.log('got uploads into modified!!', uploads)
    uploads.forEach((upload) => {
      // Ensure to discard unrelated or not-ready uploads
      if (!files_by_id.has(upload.id) || !upload.upload_id) {
        console.log('not related')
        return
      }
      upload.parts?.forEach((part) => {
        const key = `${upload.id}:${part.part}`
        if (uploads_in_progress.has(key) && part.uploaded) {
          console.log('uploading then got complete status')
          uploads_in_progress.delete(key)
        }
        if (
          !uploads_in_progress.has(key) &&
          !part.uploaded &&
          part.signed_upload_url
        ) {
          console.log('not uploading but needs uploaded and has url')
          uploadPart(
            key,
            upload.id,
            part.part,
            part.start_byte,
            part.end_byte,
            part.signed_upload_url
          )
        }
        console.log('nothin applied')
      })
    })
  }

  return {
    initUpload,
    onUploadsModified,
  }
}
