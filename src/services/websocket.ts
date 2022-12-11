interface Dependencies {
  endpoint: string
  onMessage: (data: any) => void
}

const MAGIC_RECONNECT_DELAY = 2000

interface FrameAssemblerDependencies {
  onMessage: (data: string) => void
}
interface PartInfo {
  id: string
  chunkStart: number
  chunkSize: number
  messageSize: number
  data: ArrayBuffer
}
const makeFrameAssembler = ({ onMessage }: FrameAssemblerDependencies) => {
  const partsById = new Map<string, PartInfo[]>()

  const getPartInfo = (part: ArrayBuffer) => {
    console.log('part is', typeof part, part)
    const dataView = new DataView(part)
    const id = String.fromCharCode(...new Uint8Array(part.slice(0, 4)))
    console.log('id', id)
    const chunkStart = dataView.getUint32(4, false)
    console.log('start', chunkStart)
    const chunkSize = dataView.getUint32(8, false)
    console.log('csize', chunkSize)
    const messageSize = dataView.getUint32(12, false)
    console.log('msize', messageSize)
    const data = part.slice(16)
    console.log('data', data)
    return {
      id,
      chunkStart,
      chunkSize,
      messageSize,
      data,
    }
  }

  const assembleParts = (msgSize: number, parts: PartInfo[]): string => {
    const buff = new ArrayBuffer(msgSize)
    const assembled = new Uint8Array(buff)
    parts.forEach((part) => {
      assembled.set(new Uint8Array(part.data), part.chunkStart)
    })
    return String.fromCharCode(...assembled)
  }

  return {
    add(part: ArrayBuffer) {
      const info = getPartInfo(part)
      const totalExpectedParts = Math.ceil(info.messageSize / info.chunkSize)
      const parts = partsById.get(info.id) ?? []
      parts.push(info)
      console.log(
        'checking parts we have',
        info,
        parts.length,
        totalExpectedParts
      )
      if (parts.length === totalExpectedParts) {
        const msg = assembleParts(info.messageSize, parts)
        onMessage(msg)
        partsById.delete(info.id)
      } else {
        partsById.set(info.id, parts)
      }
    },
  }
}

export const makeWebsocketService = ({ endpoint, onMessage }: Dependencies) => {
  let ws: WebSocket | undefined
  let messageQueue: string[] = []
  let isOpened = false
  const frameAssembler = makeFrameAssembler({
    onMessage(data) {
      const msg = JSON.parse(data)
      console.log('WS (in)>', msg)
      onMessage(msg)
    },
  })

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

  function str2ab(str: string) {
    var buf = new ArrayBuffer(str.length * 4) // 2 bytes for each char
    var bufView = new Uint32Array(buf)
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  }

  function onMessageEvent(event: MessageEvent<string>) {
    try {
      // frameAssembler.add(str2ab(event.data))
      onMessage(JSON.parse(event.data))
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
  }
}
