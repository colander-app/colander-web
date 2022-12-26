import { observer } from 'mobx-react-lite'
import { TableView } from '../containers/TableView'
import { useRootStore } from '../context/RootStoreContext'

export const ProjectsView = observer(() => {
  const { projects } = useRootStore()
  const onClickAdd = () => {
    // show a modal with a new resource
    alert('TODO :)')
  }
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
      rows={Array.from(projects.store.items.values())}
      zeroStateNode="No Projects"
      addBtnText="Add a Project"
      onAddBtnClick={onClickAdd}
    />
  )
})
