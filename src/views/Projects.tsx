import { TextInput } from '../components/TextInput'
import SearchIcon from '@heroicons/react/20/solid/MagnifyingGlassIcon'
import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon'
import { Button } from '../components/Button'

export const ProjectsView = () => {
  const groupVariant = 'primary'
  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="flex place-content-between">
        <div className="relative text-gray-400">
          <span className="absolute flex items-center pl-2 inset-y-0 pointer-events-none">
            <SearchIcon className="h-5 mb-1" stroke="currentColor" />
          </span>
          <TextInput
            placeholder="Search for Projects"
            className="max-w-lg pl-10"
          />
        </div>
        <div className="inline-flex" role="group">
          <Button left variant={groupVariant}>
            <ChevronLeftIcon className="h-5" stroke="currentColor" />
          </Button>
          <Button middle variant={groupVariant}>
            Middle
          </Button>
          <Button right variant={groupVariant}>
            <ChevronRightIcon className="h-5" stroke="currentColor" />
          </Button>
        </div>
      </div>
      <table className="min-w-full">
        <thead className="border-b">
          <tr>
            <th
              scope="col"
              className="text-sm font-bold text-gray-900 px-6 py-4 text-left"
            >
              Song
            </th>
            <th
              scope="col"
              className="text-sm font-bold text-gray-900 px-6 py-4 text-left"
            >
              Artist
            </th>
            <th
              scope="col"
              className="text-sm font-bold text-gray-900 px-6 py-4 text-left"
            >
              Year
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
              The Sliding Mr. Bones (Next Stop, Pottersville)
            </td>
            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
              Malcolm Lockyer
            </td>
            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
              1961
            </td>
          </tr>
          <tr className="border-b">
            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
              Witchy Woman
            </td>
            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
              The Eagles
            </td>
            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
              1972
            </td>
          </tr>
          <tr className="border-b">
            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
              Shining Star
            </td>
            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
              Earth, Wind, and Fire
            </td>
            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
              1975
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
