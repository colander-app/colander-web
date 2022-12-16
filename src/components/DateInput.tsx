import { forwardRef } from 'react'
import { TextInput } from './TextInput'

interface InputProps {
  value?: string
  onClick?: () => void
  onChange?: () => void
}

export const DateInput = forwardRef<HTMLInputElement, InputProps>(
  ({ value, onClick, onChange }, ref) => {
    return (
      <div className="control">
        <TextInput
          placeholder="Start"
          ref={ref}
          onClick={onClick}
          onChange={onChange}
          value={value}
          className="w-full"
        />
      </div>
    )
  }
)
