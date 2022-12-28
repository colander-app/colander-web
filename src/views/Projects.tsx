import { observer } from 'mobx-react-lite'
import { Outlet, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { TableView } from '../containers/TableView'
import { useRootStore } from '../context/RootStoreContext'

export const ProjectsView = observer(() => {
  const { projects } = useRootStore()
  const navigate = useNavigate()

  const onClickAdd = () => {
    const id = uuidv4()
    projects.store.set([
      {
        __type: 'project',
        id,
        name: '',
        organization_id: 'org1',
        updated_at: new Date().toISOString(),
      },
    ])
    navigate({ pathname: id, search: location.search })
  }

  return (
    <>
      <TableView
        columns={{
          name: 'Name',
          // created_on: 'Created On',
          // created_by: 'Created By',
        }}
        keyProp="id"
        searchPlaceholder="Search Projects"
        searchKeys={['name']}
        rows={Array.from(projects.store.items.values())}
        zeroStateNode="No Projects"
        addBtnText="Add a Project"
        onAddBtnClick={onClickAdd}
      />
      <Outlet />
    </>
  )
})
