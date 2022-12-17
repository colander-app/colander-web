import { observer } from 'mobx-react-lite'
import { TableView } from '../containers/TableView'
import { useRootStore } from '../context/RootStoreContext'
import Fuse from 'fuse.js'

export const ProjectsView = observer(() => {
  const { store } = useRootStore()
  return (
    <TableView
      columns={{
        name: 'Name',
        created_on: 'Created On',
        created_by: 'Created By',
      }}
      keyProp="id"
      searchPlaceholder="Search Projects"
      searchKeys={['name']}
      rows={Array.from(store.projects.values())}
      zeroStateNode="No Projects"
    />
  )
})
