import React, { useContext } from 'react'

import TheContext from '../TheContext'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'

const Participant = ({ participant, host, yourRoom, gotoRoom }) => {
  const { user, socket } = useContext(TheContext)

  const style = { textAlign: "left", display: "flex", flexDirection: "row", alignItems: "center", padding: "4px" }
  return (
    <li className="participant" style={style}>

      <div className={host ? 'host' : 'not-host'} >{participant.name}</div>



      <div className="flip-container">
        <div className="flipper">
          <div className="front">
            <Image avatar src={participant.avatar} style={{ background: "white"  }}/>   
          </div>
          <div className="back">
            {/* <button className="remove-participant">X</button> */}
            {yourRoom && !host && <button className="remove-participant" onClick={() => socket.emit('remove', participant)}>X</button> || <button className="remove-participant">🤪</button>}
          </div>
        </div>
      </div>




      {/* {host && <span>HOST</span>} */}
    </li>
  )
}

const Room = ({ room }) => {
  const { gotoRoom, user } = useContext(TheContext)
  console.log('ROOM', room, user, user.email)
  const style = {}
  const yourRoom = room.user.email == user.email
  // let host = room.activeUsers.some(x => x.email == user.email)
  return (
    <Menu.Item className="menu-item-sidebar" style={style} header width="250px" onClick={() => gotoRoom(room.id, room)} link="#">
      <Header as="h5" inverted>
        <span>{room.message}</span>
        <span className='activeUsers'>{room.activeUsers.length}</span>


        {yourRoom && <button className="close-room" onClick={() => console.log('Send everyone to lobby')} >X</button>}

      </Header>
      <List inverted>
        {room.activeUsers.length ? (
          room.activeUsers.map((x) => {
            if (x.email == user.email) {
              style.background = '#2b2b2b'

            }

            return <Participant participant={x} host={x.email == user.email} yourRoom={yourRoom} key={x.email} gotoRoom={gotoRoom} />

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
