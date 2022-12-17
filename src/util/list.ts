import Fuse from 'fuse.js'

export const filterItems =
  <T extends Record<any, any>>(search: string, keys: Array<keyof T>) =>
  (items: T[]): T[] => {
    if (!search) {
      return items
    }
    const fuse = new Fuse(items, { threshold: 0.3, keys: keys as string[] })
    return fuse.search(search).map(({ item }) => item)
  }

export const sortItems =
  <T extends Record<any, any>>(
    sortKey: string | null,
    ascending: boolean | null
  ) =>
  (items: T[]): T[] => {
    if (!sortKey) {
      return items
    }
    return [...items].sort((a, b) => {
      if (a[sortKey] > b[sortKey]) return ascending ? 1 : -1
      if (a[sortKey] < b[sortKey]) return ascending ? -1 : 1
      return 0
    })
  }

export const pageItems =
  <T extends Record<any, any>>(page: number, pageSize: number) =>
  (items: T[]): T[] => {
    return items.slice(page * pageSize, (page + 1) * pageSize)
  }
