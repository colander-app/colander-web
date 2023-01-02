import { observer } from 'mobx-react-lite'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { TextInput } from '../components/TextInput'
import { Drawer } from '../containers/Drawer'
import { useRootStore } from '../context/RootStoreContext'

export const ResourceDetailsView = observer(() => {
  const { resources } = useRootStore()
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  if (!id) {
    return null
  }

  const resource = resources.store.items.get(id)

  if (!resource) {
    return null
  }

  const changeName = (name: string) => {
    resource.changeName(name)
  }

  const onClickClose = () => {
    navigate({ pathname: '/resources', search: location.search })
  }

  return (
    <Drawer title="Resource Details" onClose={onClickClose}>
      <div className="mb-3">
        <label
          htmlFor="resourceName"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Name
        </label>
        <TextInput
          id="resourceName"
          className="w-full"
          placeholder="Resource"
          defaultValue={resource.name}
          onBlur={(e) => changeName(e.target.value)}
        />
      </div>
    </Drawer>
  )
})
