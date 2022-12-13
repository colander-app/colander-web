import { Instance, types } from 'mobx-state-tree'

export const UploadPart = types.model({
  uploaded: types.boolean,
  start_byte: types.number,
  end_byte: types.number,
  part: types.number,
  etag: types.maybe(types.string),
  signed_upload_url: types.maybe(types.string),
})

export type IUploadPart = Instance<typeof UploadPart>

export const UploadModel = types
  .model({
    __type: types.optional(types.literal('upload'), 'upload'),
    id: types.identifier,
    upload_id: types.maybe(types.string),
    status: types.enumeration(['uploading', 'failed-max-size', 'complete']),
    expire_at: types.maybe(types.number),
    event_id: types.string,
    resource_id: types.string,
    uploader: types.string,
    filename: types.string,
    content_type: types.string,
    size: types.number,
    read_link: types.maybe(
      types.model({
        expire_at: types.number,
        url: types.string,
      })
    ),
    parts: types.maybe(types.array(UploadPart)),
    updated_at: types.string,
  })
  .actions((self) => ({
    completePart(num: number, etag: string) {
      if (!self.parts) {
        return
      }
      const partIdx = self.parts.findIndex((p) => p.part === num)
      if (partIdx > -1) {
        self.parts[partIdx].uploaded = true
        self.parts[partIdx].etag = etag
        self.updated_at = new Date().toISOString()
      }
    },
  }))

export type IUploadModel = Instance<typeof UploadModel>
