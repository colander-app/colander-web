import { classNames } from '../../util/classNames'

export const ArrowUp = ({ active = false }: { active?: boolean }) => {
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
