import React, { useContext } from 'react'

import TheContext from '../TheContext'
import { Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'

const Participant = (participant) => {
  return (
    <List.Item key={participant.email}>
      <Image avatar src={participant.avatar} />
      <List.Content verticalAlign="middle">
        <List.Header>{participant.name}</List.Header>
      </List.Content>
    </List.Item>
  )
}

const Room = (room) => {
  return (
    <Menu.Item header key={room._id} width="250px">
      <Header as="h2" inverted>
        {room.message}
      </Header>
      <List inverted>{room.activeUsers.map(Participant)}</List>
    </Menu.Item>
  )
}

export default function SideBar() {
  const { activeRooms } = useContext(TheContext)
  return (
    <Sidebar
      as={Menu}
      animation="overlay"
      icon="labeled"
      inverted
      // onHide={() => setVisible(false)}
      vertical
      visible
      style={{ width: '250px' }}
    >
      {activeRooms.map(Room)}
    </Sidebar>
  )
}
