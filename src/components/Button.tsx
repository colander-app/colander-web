import { PropsWithChildren } from 'react'
import { classNames, ClassNamesInput } from '../util/classNames'

type Variants = 'default' | 'primary'

interface ButtonProps {
  left?: boolean
  middle?: boolean
  right?: boolean
  variant?: Variants
}

export const Button: React.FC<PropsWithChildren<ButtonProps>> = ({
  children,
  left = false,
  middle = false,
  right = false,
  variant = 'default',
}) => {
  const variants: Record<string, ClassNamesInput[]> = {
    primary: [
      'border-y-blue-600 text-blue-600 hover:bg-blue-600 active:bg-blue-600 focus:bg-blue-600',
      { 'border-x-blue-600': !middle },
    ],

    default: [
      'border-y-slate-600 text-slate-600 hover:bg-slate-600 active:bg-slate-600 focus:bg-slate-600',
      { 'border-x-slate-600': !middle },
    ],
  }

  const variantChoice = variants[variant]

  const classes = classNames(
    ...variantChoice,
    {
      'rounded-l': left,
      'rounded-r': right,
      'border-x-2': !middle,
    },
    'inline-block',
    'px-6',
    'py-2.5',
    'border-y-2',
    'border-solid',
    'font-medium',
    'text-xs',
    'leading-tight',
    'uppercase',
    'hover:text-white',
    'focus:text-white',
    'focus:outline-none',
    'focus:ring-0',
    'transition',
    'duration-150',
    'ease-in-out'
  )
  return (
    <button type="button" className={classes}>
      {children}
    </button>
  )
}
