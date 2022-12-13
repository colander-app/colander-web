import DatePicker from 'react-datepicker'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../context/RootStoreContext'
import { DateInput } from '../components/DateInput'
import { useNavigate, useParams } from 'react-router-dom'
import { Drawer } from '../containers/Drawer'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { ChangeEventHandler, useState } from 'react'

export const EventDetailsView = observer(() => {
  const { store, uploadService } = useRootStore()
  const { id } = useParams()
  const navigate = useNavigate()

  if (!id) {
    return null
  }

  const event = store.events.get(id)

  if (!event) {
    return null
  }

  const all_uploads = Array.from(store.uploads.values())
  const uploads = all_uploads.filter((upload) => upload.event_id === event.id)

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

  const onAddFiles: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files ?? []
    for (const file of files) {
      uploadService.initUpload(file, event.resource_id, event.id)
    }
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
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Label"
            defaultValue={event.label}
            onBlur={(e) => changeLabel(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-3">
        <label
          htmlFor="chooseStartDate"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Start Date
        </label>
        <DatePicker
          id="chooseStartDate"
          selectsStart
          onChange={changeStart}
          selected={new Date(event.start_date)}
          startDate={new Date(event.start_date)}
          endDate={new Date(event.end_date)}
          customInput={<DateInput />}
        />
      </div>
      <div className="mb-3">
        <label
          htmlFor="chooseEndDate"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          End Date
        </label>
        <DatePicker
          id="chooseEndDate"
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
        <label
          htmlFor="selectColor"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Color
        </label>
        <HexColorInput
          prefixed
          color={event.color}
          onChange={changeColor}
          id="selectColor"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <HexColorPicker color={event.color} onChange={changeColor} />
      </div>
      <div className="mb-3">
        <label className="form-label inline-block mb-2 text-gray-700">
          Attachments
          <input
            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            type="file"
            id="uploadAttachments"
            multiple
            onChange={onAddFiles}
          />
        </label>
      </div>
      <div className="mb-3">
        <ul>
          {uploads.map((upload) => (
            <li key={upload.id}>
              {upload.read_link?.url ? (
                <a target="_blank" href={upload.read_link?.url}>
                  {upload.filename}
                </a>
              ) : (
                upload.filename
              )}{' '}
              ({upload.status}{' '}
              {Math.floor(
                (100 * (upload.parts?.filter((p) => p.uploaded).length ?? 1)) /
                  (upload.parts?.length ?? 1)
              )}
              %)
              <br />
              <div style={{ width: '100%', wordWrap: 'break-word' }}>
                [
                {upload.parts?.map((p) => (
                  <span key={p.part}>
                    {p.uploaded ? (p.signed_upload_url ? '-' : '=') : '_'}
                  </span>
                ))}
                ]
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  )
})
