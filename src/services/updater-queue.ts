import { debounce } from '../util/debounce'

interface Dependencies<M> {
  update: (model: M) => Promise<void>
  onUpdateFailed: (model: M) => void
  throttleRateMs: number
}

interface BaseEntity {
  id: string
  updated_at: string
  [key: string]: any
}

const LatestItemQueue = <M extends BaseEntity>() => {
  const items: M[] = []

  const add = (adding: M) => {
    const idx = items.findIndex((_) => _.id === adding.id)
    if (idx === -1) {
      items.push(adding)
      return
    }
    if (items[idx].updated_at < adding.updated_at) {
      items[idx] = adding
    }
  }

  const get = () => {
    return items.shift()
  }

  return {
    add,
    get,
  }
}

export const makeUpdaterQueue = <M extends BaseEntity>({
  update,
  onUpdateFailed,
  throttleRateMs,
}: Dependencies<M>): ((items: M[]) => void) => {
  const queue = LatestItemQueue<M>()
  let running = false

  const setRunning = (_running: boolean = true) => {
    running = _running
  }

  const dequeueAndUpdate = debounce(async () => {
    if (running) {
      return
    }
    setRunning()
    const item = queue.get()
    if (!item) {
      setRunning(false)
      return
    }
    try {
      await update(item)
    } catch (err: any) {
      console.error('update resource failed', err.message)
      onUpdateFailed(item)
    }
    setRunning(false)
    dequeueAndUpdate()
  }, throttleRateMs)

  const enqueue = (items: M[]) => {
    items.forEach((item) => queue.add(item))
    dequeueAndUpdate()
  }

  return enqueue
}
