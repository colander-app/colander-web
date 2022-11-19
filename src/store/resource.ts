import { Instance, types } from 'mobx-state-tree'

export const ResourceModel = types.model({
  id: types.identifier,
  updatedAt: types.string,
  name: types.string,
})
export type IResourceModel = Instance<typeof ResourceModel>
