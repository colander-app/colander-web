export const debounce = (fn: Function, msRate: number) => {
  let timer: number
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(undefined, ...args)
    }, msRate)
  }
}
