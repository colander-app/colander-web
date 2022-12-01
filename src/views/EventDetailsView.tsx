import DatePicker from 'react-datepicker'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../context/RootStoreContext'
import { DateInput } from '../components/DateInput'
import { useNavigate, useParams } from 'react-router-dom'
import { Drawer } from '../containers/Drawer'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { useState } from 'react'

export const EventDetailsView = observer(() => {
  const { store } = useRootStore()
  const { id } = useParams()
  const navigate = useNavigate()
  const [showColorPicker, setShowColorPicker] = useState(false)

  if (!id) {
    return null
  }

  const [event] = store.getEvents([id])

  if (!event) {
    return null
  }

  const changeTentative = (checked: boolean) => {
    event.setTentative(checked)
  }

  const changeStart = (newStart: Date) => {
    event.changeDates(newStart.toISOString(), event.end_date)
  }

  const changeEnd = (newEnd: Date) => {
    event.changeDates(event.start_date, newEnd.toISOString())
  }

  const changeLabel = (text: string) => {
    event.updateLabel(text)
  }

  const changeColor = (color: string) => {
    event.updateColor(color)
  }

  const onClickClose = () => {
    navigate('/')
  }

  return (
    <Drawer title="Event Details" onClose={onClickClose}>
      <div className="mb-3">
        <label className="block text-gray-700 font-bold">
          <input
            className="mr-2 leading-tight"
            type="checkbox"
            checked={event.tentative}
            onChange={(e) => changeTentative(e.target.checked)}
          />
          <span className="text-sm">Tentative Event</span>
        </label>
      </div>
      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Label
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Label"
          defaultValue={event.label}
          onBlur={(e) => changeLabel(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Start Date
        </label>
        <DatePicker
          selectsStart
          onChange={changeStart}
          selected={new Date(event.start_date)}
          startDate={new Date(event.start_date)}
          endDate={new Date(event.end_date)}
          customInput={<DateInput />}
        />
      </div>
      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          End Date
        </label>
        <DatePicker
          selectsEnd
          onChange={changeEnd}
          selected={new Date(event.end_date)}
          startDate={new Date(event.start_date)}
          endDate={new Date(event.end_date)}
          minDate={new Date(event.start_date)}
          customInput={<DateInput />}
        />
      </div>
      <div className="mb-3">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Color
        </label>
        <HexColorInput
          prefixed
          color={event.color}
          onChange={changeColor}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <HexColorPicker color={event.color} onChange={changeColor} />
      </div>
    </Drawer>
  )
})
