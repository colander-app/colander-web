interface Dependencies {
  endpoint: string
  onMessage: (data: any) => void
}

const MAGIC_RECONNECT_DELAY = 2000

export const makeWebsocketService = ({ endpoint, onMessage }: Dependencies) => {
  let ws: WebSocket | undefined
  let messageQueue: string[] = []
  let isOpened = false

  const sendMessage = (data: string) => {
    if (isOpened && ws) {
      console.log('WS (out)>', data)
      ws.send(data)
    } else {
      console.log('WS (queue)>', data)
      messageQueue.push(data)
    }
  }

  function onMessageEvent(event: MessageEvent<any>) {
    try {
      console.log('WS (in)>')
      onMessage(JSON.parse(event.data))
    } catch (err) {
      console.log('WS (FORMAT_ERR)>', event.data)
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
  }
}
