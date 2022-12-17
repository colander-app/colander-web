import { classNames } from '../util/classNames'
import { ChevronLeft } from './icons/ChevronLeft'
import { ChevronRight } from './icons/ChevronRight'

export const findWindowStart = (
  viewWindow: number,
  total: number,
  current: number
): number => {
  const lowFilter = Math.max(0, current - Math.floor(viewWindow / 2))
  const highFilter = Math.max(0, total - viewWindow)
  return Math.min(lowFilter, highFilter)
}

interface PaginationProps {
  pageCount: number
  currentPage: number
  maxPageButtonCount?: number
  className?: string
  onChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  pageCount,
  currentPage,
  maxPageButtonCount = pageCount,
  className,
  onChange,
}) => {
  const prevEnabled = currentPage > 0
  const nextEnabled = currentPage < pageCount - 1
  const windowStart = findWindowStart(
    maxPageButtonCount,
    pageCount,
    currentPage
  )
  const onPrevious = () => {
    if (prevEnabled) {
      onChange(currentPage - 1)
    }
  }
  const onNext = () => {
    if (nextEnabled) {
      onChange(currentPage + 1)
    }
  }
  return (
    <nav aria-label="Data Pagination" className={className}>
      <ul className="flex items-center justify-center md:justify-start -space-x-px mx-auto">
        <li>
          <button
            disabled={!prevEnabled}
            onClick={onPrevious}
            className="block px-4 py-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:hover:bg-white disabled:hover:text-gray-500"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft />
          </button>
        </li>
        {new Array(Math.min(maxPageButtonCount, pageCount))
          .fill(0)
          .map((_, i) => {
            const page = windowStart + i
            const isCurrent = page === currentPage
            return (
              <li key={page}>
                <button
                  onClick={() => onChange(page)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={classNames({
                    'z-10 px-4 py-3 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700':
                      isCurrent,
                    'px-4 py-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700':
                      !isCurrent,
                  })}
                >
                  {page + 1}
                </button>
              </li>
            )
          })}
        <li>
          <button
            disabled={!nextEnabled}
            onClick={onNext}
            className="block px-4 py-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:hover:bg-white disabled:hover:text-gray-500"
          >
            <span className="sr-only">Next</span>
            <ChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  )
}
