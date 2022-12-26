interface Dependencies {
  endpoint: string
}

type Subscriber = (data: any) => void

const MAGIC_RECONNECT_DELAY = 2000

export const makeWebsocketService = ({ endpoint }: Dependencies) => {
  const subscribers = new Set<Subscriber>()
  let ws: WebSocket | undefined
  let messageQueue: string[] = []
  let isOpened = false

  const subscribe = (fn: Subscriber) => {
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  }

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
      subscribers.forEach((subscriber) => subscriber(msg))
    } catch (err: any) {
      console.log('WS (FORMAT_ERR)>', err?.message, event.data)
    }
  }

  function onOpenEvent() {
    console.log('WS Connected.')
    isOpened = true
    messageQueue.forEach((msg) => sendMessage(msg))
    messageQueue = []
  }

  function onCloseEvent() {
    console.log(`WS Disconnected. Reconnecting in ${MAGIC_RECONNECT_DELAY}ms`)
    isOpened = false
    ws = undefined
  }

  const createConnection = () => {
    ws = new WebSocket(endpoint)
    ws.binaryType = 'arraybuffer'
    ws.addEventListener('message', onMessageEvent)
    ws.addEventListener('open', onOpenEvent)
    ws.addEventListener('close', () => {
      onCloseEvent()
      setTimeout(createConnection, MAGIC_RECONNECT_DELAY)
    })
  }
  createConnection()

  return {
    sendMessage,
    subscribe,
  }
}
