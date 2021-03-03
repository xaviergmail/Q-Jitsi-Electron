import React, { useContext } from 'react'

import TheContext from '../TheContext'
import { Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'

const Participant = ({ participant, host }) => {
  const { user } = useContext(TheContext)

  const style = { textAlign: "left", display: "flex", flexDirection: "row", alignItems: "center", padding: "4px", background: participant.email == user.email && "#2b2b2b"}
  return (
    <List.Item style={style}>
      <Image avatar src={participant.avatar} style={{ background: "white"  }}/>
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
    <Menu.Item header width="250px" onClick={() => gotoRoom(room.id)} link="#">
      <Header as="h2" inverted>
        {room.message}
      </Header>
      <List inverted>
        {room.activeUsers.length ? (
          room.activeUsers.map((x) => (
            <Participant participant={x} host={x.email == room.user.email} key={x.email} />
          ))
        ) : (
          <Header as="p" inverted>
            
            No users
          
          </Header>
        )}
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
      {video}
      {activeRooms.map((room) => (
        <Room room={room} key={room.id} />
      ))}
    </Sidebar>
  )
}
