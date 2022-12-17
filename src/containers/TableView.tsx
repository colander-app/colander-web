import { TextInput } from '../components/TextInput'
import SearchIcon from '@heroicons/react/20/solid/MagnifyingGlassIcon'
import { ChangeEvent, ReactNode, useState } from 'react'
import { Pagination } from '../components/Pagination'
import { chain } from '../util/chain'
import { ArrowUp } from '../components/icons/ArrowUp'
import { ArrowDown } from '../components/icons/ArrowDown'
import { filterItems, pageItems, sortItems } from '../util/list'
interface SortBtnProps {
  enabled?: boolean
  ascending?: boolean | null
}
const SortBtn: React.FC<SortBtnProps> = ({
  enabled = false,
  ascending = true,
}) => {
  return (
    <>
      <ArrowUp active={Boolean(ascending && enabled)} />
      <ArrowDown active={Boolean(!ascending && enabled)} />
    </>
  )
}
interface SortColumnHeader {
  title: string
  value: string
  sortKey: string | null
  ascending: boolean | null
  onClick: (title: string) => void
}
const SortColumnHeader: React.FC<SortColumnHeader> = ({
  title,
  value,
  sortKey,
  ascending,
  onClick,
}) => {
  return (
    <button
      className="flex flex-row content-center justify-center items-center"
      onClick={() => onClick(value)}
    >
      <span className="pr-2">{title}</span>
      <SortBtn enabled={sortKey === value} ascending={ascending} />
    </button>
  )
}

interface TableViewProps<T extends Record<string, any>> {
  columns: { [K in keyof T]?: string }
  rows: T[]
  searchKeys: Array<keyof T>
  keyProp: keyof T
  searchPlaceholder?: string
  pageSize?: number
  zeroStateNode?: ReactNode
}
export const TableView = <T extends Record<string, any>>({
  columns,
  rows,
  searchKeys,
  keyProp,
  searchPlaceholder = '',
  pageSize = 10,
  zeroStateNode = 'No Data to Display',
}: TableViewProps<T>) => {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAscending, setSortAscending] = useState<boolean | null>(null)

  const toggleFilter = (field: string) => {
    if (sortKey === field) {
      if (sortAscending) {
        setSortAscending(false)
      } else {
        setSortKey(null)
        setSortAscending(null)
      }
    } else {
      setSortKey(field)
      setSortAscending(true)
    }
  }

  const onChangePage = (p: number) => {
    setPage(p)
  }

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const filterSortAndPage = chain(
    filterItems(search, searchKeys),
    sortItems(sortKey, sortAscending),
    pageItems(page, pageSize)
  )
  const viewItems = filterSortAndPage(rows)

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="md:flex sm:content-center md:place-content-between">
        <div className="relative text-gray-400 basis-1/2">
          <span className="absolute flex items-center pl-2 inset-y-0 pointer-events-none">
            <SearchIcon className="h-5 mb-1" stroke="currentColor" />
          </span>
          <TextInput
            placeholder={searchPlaceholder}
            className="pl-10 w-full"
            value={search}
            onChange={onSearchChange}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b">
            <tr>
              {Object.keys(columns).map((key) => (
                <th
                  key={key}
                  scope="col"
                  className="text-sm font-bold text-gray-900 px-6 py-4 text-left"
                >
                  <SortColumnHeader
                    value={key}
                    title={columns[key] ?? 'No Title'}
                    sortKey={sortKey}
                    ascending={sortAscending}
                    onClick={toggleFilter}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viewItems.map((row) => (
              <tr className="border-b" key={row[keyProp]}>
                {Object.keys(columns).map((key) => (
                  <td
                    key={key}
                    className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap"
                  >
                    {row[key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <h1 className="text-xl text-center m-14">{zeroStateNode}</h1>
        )}
      </div>
      <Pagination
        className="my-5"
        maxPageButtonCount={5}
        currentPage={page}
        pageCount={Math.ceil(rows.length / pageSize)}
        onChange={onChangePage}
      />
    </div>
  )
}
