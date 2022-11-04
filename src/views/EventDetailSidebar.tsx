import DatePicker from 'react-datepicker'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useRootStore } from '../context/RootStoreContext'
import { forwardRef } from 'react'

const SidebarContainer = styled.div`
  border-left: solid 1px ${({ theme }) => theme.borderColor};
  background: #fff;
`

interface InputProps {
  value?: string
  onClick?: () => void
  onChange?: () => void
}

const DateInput = forwardRef<HTMLInputElement, InputProps>(
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

export const EventDetailSidebar = observer(() => {
  const { store } = useRootStore()
  const { id } = useParams()

  if (!id) {
    return null
  }

  const [event] = store.getEvents([id])

  if (!event) {
    return null
  }

  const changeStart = (d: Date) => {
    event.changeDates(d, event.end)
  }

  const changeEnd = (d: Date) => {
    event.changeDates(event.start, d)
  }

  const changeLabel = (value: string) => {
    event.updateLabel(value)
  }

  return (
    <SidebarContainer className="column is-one-quarter is-full-mobile px-3">
      <h2 className="is-size-3 mb-4">Event Details</h2>
      <div className="field">
        <div className="label">Label</div>
        <div className="control">
          <input
            key={`${event.id}-${event.label}`}
            className="input"
            type="text"
            placeholder="Label"
            defaultValue={event.label}
            onBlur={(e) => changeLabel(e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <div className="label">Start Date</div>
        <DatePicker
          selectsStart
          selected={event.start}
          onChange={changeStart}
          startDate={event.start}
          endDate={event.end}
          customInput={<DateInput />}
        />
      </div>
      <div className="field">
        <div className="label">End Date</div>
        <DatePicker
          selectsEnd
          selected={event.end}
          onChange={changeEnd}
          startDate={event.start}
          endDate={event.end}
          minDate={event.start}
          customInput={<DateInput />}
        />
      </div>
    </SidebarContainer>
  )
})
