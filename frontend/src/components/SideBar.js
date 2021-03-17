import React, { useContext } from 'react'

import TheContext from '../TheContext'
import { Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'

const Participant = ({ participant, host, yourRoom, gotoRoom }) => {
  const { user, socket } = useContext(TheContext)

  const style = { textAlign: "left", display: "flex", flexDirection: "row", alignItems: "center", padding: "4px" }
  return (
    <List.Item className="participant" style={style}>
      <Image avatar src={participant.avatar} style={{ background: "white"  }}/>
      <List.Content verticalAlign="middle">
        <List.Header>{participant.name}  {yourRoom && !host && <button className="remove-participant" onClick={() => socket.emit('remove', participant)}>X</button>}</List.Header>
        {host && <List.Description>HOST</List.Description>} {yourRoom && host && <button className="close-room" onClick={() => console.log('Send everyone to lobby')} >Close</button>}
      </List.Content>
    </List.Item>
  )
}

const Room = ({ room }) => {
  const { gotoRoom, user } = useContext(TheContext)
  console.log('ROOM', room, user, user.email)
  const style = {}

  return (
    <Menu.Item className="menu-item-sidebar" style={style} header width="250px" onClick={() => gotoRoom(room.id, room)} link="#">
      <Header as="h5" inverted>
        {room.message}
      </Header>
      <List inverted>
        {room.activeUsers.length ? (
          room.activeUsers.map((x) => {
            if (x.email == user.email) {
              style.background = '#2b2b2b'

            }
            return (

              <Participant participant={x} host={x.email == room.user.email} yourRoom={room.user.email == user.email} key={x.email} gotoRoom={gotoRoom} />

            )
          })
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
