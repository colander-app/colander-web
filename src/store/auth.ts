import { types } from 'mobx-state-tree'

export const authStoreModel = types
  .model({
    loggedIn: types.boolean,
  })
  .actions((self) => ({
    setLoggedIn(_loggedIn: boolean) {
      self.loggedIn = _loggedIn
    },
  }))
