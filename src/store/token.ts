import { Instance, types } from 'mobx-state-tree'

export const TokenModel = types.model('Token', {
  __type: types.optional(types.literal('token'), 'token'),
  id: types.identifier,
  family: types.string,
  email: types.string,
  access_token: types.string,
  refresh_token: types.string,
})
export type ITokenModel = Instance<typeof TokenModel>
