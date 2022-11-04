interface Dependencies<M> {
  update: (model: M) => Promise<void>
  onUpdateFailed: (model: M) => void
}

interface BaseEntity {
  id: string
  updatedAt: number
  [key: string]: any
}

export const makeUpdaterQueue = <M extends BaseEntity>({
  update,
  onUpdateFailed,
}: Dependencies<M>): ((items: M[]) => void) => {
  const queue: M[] = []
  let running = false

  const setRunning = (_running: boolean = true) => {
    running = _running
  }

  const dequeueAndUpdate = async () => {
    if (running) {
      return
    }
    setRunning()
    const item = queue.shift()
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
  }

  const enqueue = (items: M[]) => {
    const dedeupedItems = items.filter(
      ({ id, updatedAt }) =>
        queue.find(
          (qItem) => qItem.id === id && qItem.updatedAt === updatedAt
        ) === undefined
    )
    queue.push(...dedeupedItems)
    dequeueAndUpdate()
  }

  return enqueue
}
