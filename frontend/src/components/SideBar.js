import React, { useContext, useState } from 'react'

import TheContext from '../TheContext'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'
import Search from './Search'
import { Link, useLocation } from 'react-router-dom'

import Chat from './Chat'


const Participant = ({ participant, host, yourRoom }) => {
  const { user, socket, gotoRoom } = useContext(TheContext)

  const style = { textAlign: "left", display: "flex", flexDirection: "row", alignItems: "center", padding: "4px" }
  return (
    <li className="participant" style={style}>
      <div className={host ? 'host' : 'not-host'}>{participant.name}</div>

      <div className="flip-container">
        <div className="flipper">
          <div className="front">
            <Image avatar src={participant.avatar} style={{ background: 'white' }} />
          </div>
          <div className="back">
            {/* <button className="remove-participant">X</button> */}
            {(yourRoom && !host.lol && (
              <button
                className="remove-participant"
                onClick={(e) => {
                  e.preventDefault(); console.log("console.lop"); socket.emit('remove', participant.email); goToRoom(null);
                }}
              >
                X
              </button>
            )) || <button className="remove-participant">🤪</button>}
          </div>
        </div>
      </div>

      {/* {host && <span>HOST</span>} */}
    </li>
  )
}

const Room = ({ room }) => {
  const { gotoRoom, user } = useContext(TheContext)
  // console.log('ROOM', room, user, user.email)
  //console.log(room, 'jurassic park')
  const style = {}
  const yourRoom = room.user.email == user.email
  const currentRoom = room._id === location.hash.split('/').pop()
  if (currentRoom) {
    style.backgroundColor = '#2b2b2b'
    style.textDecoration = 'underline'
    // style.fontFamily = "Futura"
    style.borderRight = '20px solid rgb(43, 43, 43)'
  }
  // let host = room.activeUsers.some(x => x.email == user.email)
  return (
    <Link to={`/chat/${room._id}`}>
      {/* onClick={() => gotoRoom(room.id, room)} */}

    <Menu.Item className="menu-item-sidebar" style={style} header width="250px"  link="#">
      <Header as="h5" inverted>

        <span>{room.message}</span>
          {room.activeUsers.length !== 0 && <span className='activeUsers'>{room.activeUsers.length}</span>}


        {yourRoom && <button className="close-room" onClick={() => console.log('Send everyone to lobby')} >X</button>}

      </Header>

        {currentRoom && !yourRoom ? (
          <div className="controls">
            <button onClick={() => gotoRoom(room._id, room)}>
              <Icon name="video" />

          </button>
            <button onClick={() => gotoRoom(room._id, room)}>
              <Icon name="laptop" />

          </button>
          </div>)

          : null}

        {room.activeUsers.length !== 0 &&

      <List inverted>
        {room.activeUsers.length ? (
          room.activeUsers.map((x) => {
            if (x.email == user.email) {
              // style.backgroundColor = '#2b2b2b'
              style.color = '#4DAA57'
              style.textDecoration = 'none'
              style.fontSize = ".875rem"
              style.cursor = 'pointer'
            }





            return <Participant participant={x} host={x.email == user.email} yourRoom={yourRoom} key={x.email} gotoRoom={gotoRoom} />

          })
        ) : (
          <Header as="p" inverted>
            
            No users
          
          </Header>
        )}
      </List>

        }
    </Menu.Item>
    </Link>
  )
}

export default function SideBar({ video }) {
  const { activeRooms, room, gotoRoom, posts, setStyle, style, query, className, setClassName } = useContext(TheContext)
  // let [style, setStyle] = useState({ width: '250px' })
  // console.log(posts, ' -=-=-=-=-=-', activeRooms, '?', Object.values(posts))

  // console.log(query, 'frisbee', posts)
  const sortedRooms = Object.values(posts)
    .filter(
      (x) =>
        (x.message.toLowerCase().includes(query.toLowerCase())) || //&& x.active && x.activeUsers.length) ||
        x.id == 'lobby' ||
        x.isLobby
      // (x) => (x.active && x.activeUsers.length) || x.id == 'lobby' || x.isLobby
    ).sort((a, b) => a.active ? -1 : 1)


  // const activeRooms = Object.values(posts).filter(
  //   (x) =>
  //     (x.message.toLowerCase().includes(query.toLowerCase()) && x.active && x.activeUsers.length) ||
  //     x.id == 'lobby' ||
  //     x.isLobby
  //   // (x) => (x.active && x.activeUsers.length) || x.id == 'lobby' || x.isLobby
  // )
  return (
    <>
    <Sidebar
      as={Menu}
      animation="overlay"
      icon="labeled"
      inverted
      // onHide={() => setVisible(false)}
      vertical
      className="style-3"
      visible
      style={style.sideBar}
    >
        <Search setStyle={setStyle} setClassName={setClassName} className={className} />

      {video}
        {sortedRooms.length > 0 ? (sortedRooms.map((room) => (
        <Room room={room} key={room.id} />
        ))) : <h3>No Rooms Found :(</h3>}
    </Sidebar>
      {/* <Chat /> */}

    </>
  )
}
