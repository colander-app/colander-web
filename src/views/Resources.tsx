import { observer } from 'mobx-react-lite'
import { TableView } from '../containers/TableView'
import { useRootStore } from '../context/RootStoreContext'

export const ResourcesView = observer(() => {
  const { store } = useRootStore()
  return (
    <TableView
      columns={{
        name: 'Name',
        // created_on: 'Created On',
        // created_by: 'Created By',
      }}
      keyProp="id"
      searchPlaceholder="Search Resources"
      searchKeys={['name']}
      rows={Array.from(store.resources.values())}
      zeroStateNode="No Resources"
    />
  )
})
