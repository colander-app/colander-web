type Providers = 'okta'

export interface AuthService {
  loggedIn: () => boolean
  sendMagicLink: (email: string) => void
  loginWithCode: (code: string) => void
  loginWithProvider: (provider: Providers) => void
}

const makeAuthService = (): AuthService => {
  return {
    loggedIn() {
      return true
    },
    sendMagicLink(email) {},
    loginWithCode(code) {},
    loginWithProvider(provider) {},
  }
}
