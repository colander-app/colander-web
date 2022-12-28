import { Instance, types } from 'mobx-state-tree'

export const ProjectModel = types
  .model('Project', {
    __type: types.optional(types.literal('project'), 'project'),
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
export type IProjectModel = Instance<typeof ProjectModel>
