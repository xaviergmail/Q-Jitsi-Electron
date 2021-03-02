import React, { useContext } from 'react'

import TheContext from '../TheContext'
import { Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'

const Participant = ({ participant, host }) => {
  return (
    <List.Item>
      <Image avatar src={participant.avatar} />
      <List.Content verticalAlign="middle">
        <List.Header>{participant.name}</List.Header>
        {host && <List.Description>HOST</List.Description>}
      </List.Content>
    </List.Item>
  )
}

const Room = ({ room }) => {
  const { gotoRoom } = useContext(TheContext)
  console.log('ROOM', room)

  return (
    <Menu.Item header width="250px" onClick={() => gotoRoom(room._id)} link="#">
      <Header as="h2" inverted>
        {room.message}
      </Header>
      <List inverted>
        {room.activeUsers.map((x) => (
          <Participant participant={x} host={x.email == room.user.email} key={x.email} />
        ))}
      </List>
    </Menu.Item>
  )
}

export default function SideBar({ video }) {
  const { activeRooms, room, gotoRoom } = useContext(TheContext)

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
      <Menu.Item link onClick={() => gotoRoom('lobby')}>
        <Header inverted>{room === 'lobby' ? 'Lobby' : 'Back to Lobby'}</Header>
      </Menu.Item>
      {video}
      {activeRooms.map((room) => (
        <Room room={room} key={room._id} />
      ))}
    </Sidebar>
  )
}
