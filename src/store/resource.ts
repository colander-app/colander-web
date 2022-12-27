import { Instance, types } from 'mobx-state-tree'

export const ResourceModel = types
  .model('Resource', {
    __type: types.optional(types.literal('resource'), 'resource'),
    id: types.identifier,
    name: types.string,
    organization_id: types.string,
    updated_at: types.string,
  })
  .actions((self) => ({
    changeName(name: string) {
      self.name = name
      self.updated_at = new Date().toISOString()
    },
  }))
export type IResourceModel = Instance<typeof ResourceModel>
