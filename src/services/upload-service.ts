import ky from 'ky'
import { SnapshotOrInstance } from 'mobx-state-tree'
import { UploadModel } from '../store/upload'

export interface UploadService {
  initUpload: (file: File, resource_id: string, event_id: string) => void
  onUploadsModified: (
    uploads: Array<SnapshotOrInstance<typeof UploadModel>>
  ) => void
}

interface Dependencies {
  onNewUpload: (
    filename: string,
    size: number,
    content_type: string,
    resource_id: string,
    event_id: string
  ) => void
  onPartUploaded: (upload_id: string, part: number, etag: string) => void
}

export const makeUploadService = ({
  onNewUpload,
  onPartUploaded,
}: Dependencies): UploadService => {
  const files = new Map<string, File>()
  const uploads_in_progress = new Set<string>()

  const initUpload = (file: File, resource_id: string, event_id: string) => {
    onNewUpload(file.name, file.size, file.type, resource_id, event_id)
    files.set(file.name, file)
  }

  const uploadPart = (
    key: string,
    id: string,
    filename: string,
    part: number,
    start: number,
    end: number,
    url: string
  ) => {
    const file = files.get(filename)
    if (!file) {
      return
    }
    uploads_in_progress.add(key)
    const reader = new FileReader()
    reader.onload = async () => {
      const result = await ky.put(url, {
        body: reader.result,
        throwHttpErrors: false,
      })
      const etag = result.headers.get('ETag')
      if (!etag || result.status !== 200) {
        console.warn('unable to upload part, we need retry logic.', {
          part,
          error: await result.text(),
          errorCode: result.status,
          headers: [...result.headers],
          result,
        })
      } else {
        onPartUploaded(id, part, etag)
      }
    }
    const slice = file.slice(start, end)
    reader.readAsArrayBuffer(slice)
  }

  const onUploadsModified = (
    uploads: Array<SnapshotOrInstance<typeof UploadModel>>
  ) => {
    uploads.forEach((upload) => {
      // Ensure to discard unrelated or not-ready uploads
      if (!files.has(upload.filename) || !upload.upload_id) {
        return
      }
      upload.parts?.forEach((part) => {
        const key = `${upload.id}:${part.part}`
        if (uploads_in_progress.has(key) && part.uploaded) {
          uploads_in_progress.delete(key)
        }
        if (
          !uploads_in_progress.has(key) &&
          !part.uploaded &&
          part.signed_upload_url
        ) {
          uploadPart(
            key,
            upload.id,
            upload.filename,
            part.part,
            part.start_byte,
            part.end_byte,
            part.signed_upload_url
          )
        }
      })
    })
  }

  return {
    initUpload,
    onUploadsModified,
  }
}
