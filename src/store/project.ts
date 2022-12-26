import { Instance, types } from 'mobx-state-tree'

export const ProjectModel = types.model('Project', {
  __type: types.optional(types.literal('project'), 'project'),
  id: types.identifier,
  name: types.string,
  organization_id: types.string,
  created_by: types.string,
  created_on: types.string,
  updated_at: types.string,
})
export type IProjectModel = Instance<typeof ProjectModel>
