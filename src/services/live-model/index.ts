type Unsubscribe = () => void
type Params = Record<string, any>

export interface LiveModelService {
  subscribe: (query: Params) => Unsubscribe
}

export type DataService = (
  url: string,
  params: Params,
  messageCallback: (channel: string, data: any) => void
) => Unsubscribe

interface Dependencies {
  endpoint: string
  onUpdate: (channel: string, model: Params[]) => void
  connect: DataService
}

export const makeLiveModelService = ({
  endpoint,
  onUpdate,
  connect,
}: Dependencies): LiveModelService => {
  const subscribe = (query: Params) => {
    const close = connect(endpoint, query, onUpdate)
    return function unsubscribe() {
      close()
    }
  }
  return { subscribe }
}
