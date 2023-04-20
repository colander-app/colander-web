import { Instance, types } from 'mobx-state-tree'
import { string } from 'mobx-state-tree/dist/internal'

export const TokenModel = types.model('Token', {
  __type: types.optional(types.literal('token'), 'token'),
  id: types.identifier,
  family: types.string,
  email: string,
  access_token: string,
  refresh_token: string,
})
export type ITokenModel = Instance<typeof TokenModel>
