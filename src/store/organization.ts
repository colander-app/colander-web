import { Instance, types } from 'mobx-state-tree'

export const OrganizationModel = types.model('Organization', {
  __type: types.optional(types.literal('organization'), 'organization'),
  id: types.identifier,
  name: types.string,
  organization_id: types.string,
  updated_at: types.string,
})
export type IOrganizationModel = Instance<typeof OrganizationModel>
