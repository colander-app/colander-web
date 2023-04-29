interface Dependencies {
  endpoint: string
  autoConnect?: boolean
}

const MAGIC_RECONNECT_DELAY = 2000

const makeSubscribers = <T>() => {
  const subscribers = new Set<(msg: T) => void>()
  return {
    subscribe(fn: (msg: T) => void) {
      subscribers.add(fn)
      return () => subscribers.delete(fn)
    },
    notify(msg: T) {
      subscribers.forEach((subscriber) => subscriber(msg))
    },
  }
}

export const makeWebsocketService = ({
  endpoint,
  autoConnect = true,
}: Dependencies) => {
  const messageSubscribers = makeSubscribers<any>()
  const statusSubscribers = makeSubscribers<boolean>()
  let ws: WebSocket | undefined
  let messageQueue: string[] = []
  let isOpened = false
  let makeConnectionStale: undefined | (() => void)

  const sendMessage = (data: string | Record<string, any>) => {
    const msg = typeof data === 'string' ? data : JSON.stringify(data)
    if (isOpened && ws) {
      console.log('WS (out)>', data)
      ws.send(msg)
    } else {
      console.log('WS (queue)>', data)
      messageQueue.push(msg)
    }
  }

  function onMessageEvent(event: MessageEvent<string>) {
    try {
      const msg = JSON.parse(event.data)
      messageSubscribers.notify(msg)
    } catch (err: any) {
      console.log('WS (FORMAT_ERR)>', err?.message, event.data)
    }
  }

  function onOpenEvent() {
    console.log('WS Connected.')
    statusSubscribers.notify(true)
    isOpened = true
    messageQueue.forEach((msg) => sendMessage(msg))
    messageQueue = []
  }

  function onCloseEvent() {
    console.log(`WS Disconnected. Reconnecting in ${MAGIC_RECONNECT_DELAY}ms`)
    statusSubscribers.notify(false)
    isOpened = false
    ws = undefined
  }

  const createConnection = (url: string) => {
    let stale = false
    ws = new WebSocket(url)
    ws.binaryType = 'arraybuffer'
    ws.addEventListener('message', onMessageEvent)
    ws.addEventListener('open', onOpenEvent)
    ws.addEventListener('close', () => {
      onCloseEvent()
      if (!stale) {
        setTimeout(createConnection, MAGIC_RECONNECT_DELAY)
      }
    })
    return function makeStaleAndDisconnect() {
      stale = true
      ws?.close()
    }
  }

  const reconnectWithUrl = (url: string) => {
    makeConnectionStale?.()
    makeConnectionStale = createConnection(url)
  }

  if (autoConnect) {
    makeConnectionStale = createConnection(endpoint)
  }

  return {
    sendMessage,
    reconnectWithUrl,
    subscribe: messageSubscribers.subscribe,
    subscribeStatus: statusSubscribers.subscribe,
  }
}
