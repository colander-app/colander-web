import { observer } from 'mobx-react-lite'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { TableView } from '../containers/TableView'
import { useRootStore } from '../context/RootStoreContext'
import { IResourceModel } from '../store/resource'

export const ResourcesView = observer(() => {
  const { resources } = useRootStore()
  const navigate = useNavigate()
  const location = useLocation()

  const onClickAdd = () => {
    const id = uuidv4()
    resources.store.set([
      {
        __type: 'resource',
        id,
        name: '',
        organization_id: 'org1',
        updated_at: new Date().toISOString(),
      },
    ])
    navigate({ pathname: id, search: location.search })
  }

  const onClickRow = (resource: IResourceModel) => {
    navigate({ pathname: resource.id, search: location.search })
  }

  return (
    <>
      <TableView
        columns={{
          name: 'Name',
        }}
        keyProp="id"
        searchPlaceholder="Search Resources"
        searchKeys={['name']}
        rows={Array.from(resources.store.items.values())}
        zeroStateNode="No Resources"
        addBtnText="Add a Resource"
        onAddBtnClick={onClickAdd}
        onClickRow={onClickRow}
      />
      <Outlet />
    </>
  )
})
