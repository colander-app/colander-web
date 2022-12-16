import { TextInput } from '../components/TextInput'
import SearchIcon from '@heroicons/react/20/solid/MagnifyingGlassIcon'
import { PropsWithChildren, ReactNode, useState } from 'react'
import { Pagination } from '../components/Pagination'
import { classNames } from '../util/classNames'

const Table: React.FC<PropsWithChildren> = ({ children }) => (
  <table className="min-w-full">{children}</table>
)
const TableHead: React.FC<PropsWithChildren> = ({ children }) => (
  <thead className="border-b">{children}</thead>
)
const TableHeadRow: React.FC<PropsWithChildren> = ({ children }) => (
  <tr>{children}</tr>
)
const TableHeadData: React.FC<PropsWithChildren> = ({ children }) => (
  <th
    scope="col"
    className="text-sm font-bold text-gray-900 px-6 py-4 text-left"
  >
    {children}
  </th>
)
const TableRow: React.FC<PropsWithChildren> = ({ children }) => (
  <tr className="border-b">{children}</tr>
)
const TableData: React.FC<PropsWithChildren> = ({ children }) => (
  <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
    {children}
  </td>
)
interface SortColumnHeader {
  title: string
  sortKey: string | null
  ascending: boolean | null
  onClick: (title: string) => void
}
const SortColumnHeader: React.FC<SortColumnHeader> = ({
  title,
  sortKey,
  ascending,
  onClick,
}) => {
  return (
    <button
      className="flex flex-row content-center justify-center items-center"
      onClick={() => onClick(title)}
    >
      <span className="pr-2">{title}</span>
      <SortBtn enabled={sortKey === title} ascending={ascending} />
    </button>
  )
}

const ArrowDown = ({ active = false }: { active?: boolean }) => {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 20 10"
      xmlns="http://www.w3.org/2000/svg"
      className={classNames({
        'fill-gray-600': active,
        'fill-gray-300': !active,
      })}
    >
      <polygon points="0,0 20,0 10,10" />
    </svg>
  )
}

const ArrowUp = ({ active = false }: { active?: boolean }) => {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 20 10"
      xmlns="http://www.w3.org/2000/svg"
      className={classNames({
        'fill-gray-600': active,
        'fill-gray-300': !active,
      })}
    >
      <polygon points="0,10 20,10 10,0" />
    </svg>
  )
}

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

interface TableViewProps {
  columns: Record<string, string>
  rows: Record<string, any>[]
  pageSize?: number
  zeroStateNode?: ReactNode
}
export const TableView: React.FC<TableViewProps> = ({
  columns,
  rows,
  pageSize = 10,
  zeroStateNode = 'No Data to Display',
}) => {
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
  const [page, setPage] = useState(0)
  const onChangePage = (p: number) => {
    setPage(p)
  }
  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="md:flex sm:content-center md:place-content-between">
        <div className="relative text-gray-400 basis-1/2">
          <span className="absolute flex items-center pl-2 inset-y-0 pointer-events-none">
            <SearchIcon className="h-5 mb-1" stroke="currentColor" />
          </span>
          <TextInput
            placeholder="Search for Projects"
            className="pl-10 w-full"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableHeadRow>
              {Object.keys(columns).map((key) => (
                <TableHeadData key={key}>
                  <SortColumnHeader
                    title={columns[key]}
                    sortKey={sortKey}
                    ascending={sortAscending}
                    onClick={() => toggleFilter(key)}
                  />
                </TableHeadData>
              ))}
            </TableHeadRow>
          </TableHead>
          <tbody>
            {rows.slice(page * pageSize, (page + 1) * pageSize).map((row) => (
              <TableRow>
                {Object.keys(columns).map((key) => (
                  <TableData key={key}>{row[key] ?? '-'}</TableData>
                ))}
              </TableRow>
            ))}
          </tbody>
        </Table>
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
