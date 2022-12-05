export type ClassNamesInput = string | Record<string, boolean>

export function classNames(...classes: Array<ClassNamesInput>): string {
  return classes
    .filter(Boolean)
    .map((o) => {
      if (typeof o === 'string') {
        return o
      }
      const keys = Object.keys(o)
      return keys
        .map((key) => (o[key] ? key : false))
        .filter(Boolean)
        .join(' ')
    })
    .join(' ')
}
