import styled from 'styled-components'

const SidebarContainer = styled.div`
  border-left: solid 1px ${({ theme }) => theme.borderColor};
  width: 400px;
  height: 100%;
  background: #fff;
  position: fixed;
  top: 0px;
  right: 0px;
  z-index: 10;
`
export const EventDetailSidebar = () => {
  return (
    <SidebarContainer className="px-3">
      <h2 className="is-size-3">Event</h2>
      <input className="input" type="text" placeholder="Label" />
    </SidebarContainer>
  )
}
