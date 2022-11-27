import { forwardRef } from 'react'

interface InputProps {
  value?: string
  onClick?: () => void
  onChange?: () => void
}

export const DateInput = forwardRef<HTMLInputElement, InputProps>(
  ({ value, onClick, onChange }, ref) => {
    return (
      <div className="control">
        <input
          className="input"
          placeholder="Start"
          ref={ref}
          onClick={onClick}
          onChange={onChange}
          value={value}
        />
      </div>
    )
  }
)
