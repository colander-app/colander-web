import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { TextInput } from '../components/TextInput'
import { Drawer } from '../containers/Drawer'
import { useRootStore } from '../context/RootStoreContext'

export const ProjectDetailsView = () => {
  const { projects } = useRootStore()
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  if (!id) {
    return null
  }

  const project = projects.store.items.get(id)

  if (!project) {
    return null
  }

  const changeName = (name: string) => {
    project.changeName(name)
  }

  const onClickClose = () => {
    navigate({ pathname: '/projects', search: location.search })
  }

  return (
    <Drawer title="Project Details" onClose={onClickClose}>
      <div className="mb-3">
        <label
          htmlFor="projectName"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Name
        </label>
        <TextInput
          id="projectName"
          className="w-full"
          placeholder="Project"
          defaultValue={project.name}
          onBlur={(e) => changeName(e.target.value)}
        />
      </div>
    </Drawer>
  )
}
