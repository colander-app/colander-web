import { Instance, types } from 'mobx-state-tree'

export const ProjectModel = types.model({
  id: types.identifier,
  updatedAt: types.Date,
  name: types.string,
})
export type IProjectModel = Instance<typeof ProjectModel>
