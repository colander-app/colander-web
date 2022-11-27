import { Instance, types } from 'mobx-state-tree'

export const ProjectModel = types.model({
  __type: types.optional(types.literal('project'), 'project'),
  id: types.identifier,
  name: types.string,
  events: types.array(types.string),
  organization_id: types.string,
  updated_at: types.string,
})
export type IProjectModel = Instance<typeof ProjectModel>
