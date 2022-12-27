import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Drawer } from '../containers/Drawer'
import { useRootStore } from '../context/RootStoreContext'

export const ProjectDetailsView = () => {
  const { projects } = useRootStore()
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const onClickClose = () => {
    navigate({ pathname: '/projects', search: location.search })
  }

  return (
    <Drawer title="Project Details" onClose={onClickClose}>
      <div className="mb-3"></div>
    </Drawer>
  )
}
