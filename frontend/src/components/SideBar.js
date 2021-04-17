import React, { useContext, useState } from 'react'

import TheContext from '../TheContext'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'
import Search from './Search'
import { Link, useLocation } from 'react-router-dom'

import Chat from './Chat'


const Participant = ({ participant, host, yourRoom }) => {
  const { user, socket, gotoRoom, liveUsers } = useContext(TheContext)
  const [active, setActive] = useState(false)
  const style = { textAlign: "left", display: "flex", flexDirection: "row", alignItems: "center", padding: "4px" }
  return (

    <span className="particpant-container">
      <Image avatar src={participant.avatar} style={{ background: 'white' }} />
      <p className='participant-name'>{participant.name}</p>
    </span>
  )
}



{/*}
    <li className="participant" style={style}>
      <div className={host ? 'host' : 'not-host'}>{participant.name}</div>

      <div className="flip-container">
        <div className="flipper">
          <div className="front">
            <Image avatar src={participant.avatar} style={{ background: 'white' }} />
          </div>
          <div className="back">

            {(yourRoom && !host.lol && (
              <button
                className="remove-participant"
                onClick={(e) => {
                  e.preventDefault(); console.log("console.lop"); socket.emit('remove', participant?.email); goToRoom(null);
                }}
              >
                X
              </button>
            )) || <button className="remove-participant">🤪</button>}
          </div>
        </div>
      </div>


    </li>
              */}

              
const Room = ({ room, id }) => {
  const { gotoRoom, user } = useContext(TheContext)
  // console.log('ROOM', room, user, user.email)
  const style = {}
  const yourRoom = room?.user?.email == user?.email
  const currentRoom = room?._id === location.hash.split('/').pop()
  if (currentRoom) {
    style.backgroundColor = '#2b2b2b'
    style.textDecoration = 'underline'
    // style.fontFamily = "Futura"
    style.borderRight = '20px solid rgb(43, 43, 43)'
  }
  // let host = room.activeUsers.some(x => x.email == user.email)
  return (
    <div>
    <Link key={room._id} to={{ pathname: `/chat/${room?._id}`, state: room }} >
      {/* onClick={() => gotoRoom(room.id, room)} */}

        <Menu.Item key={room._id} className="otherItem menu-item-sidebar" style={style} header>

        <Header key={room._id} as="h5" inverted>

          <span>{room?.message}</span>
            {/* {room?.activeUsers.length !== 0 && <span className='activeUsers'>{room?.activeUsers?.length}</span>} */}

            <div className='activeUsers'>  {room.messageIds.reduce((acc, cur) => !cur.read ? 1 + acc : 0, 0)} </div>


            
        {yourRoom && <button className="close-room" onClick={() => console.log('Send everyone to lobby')} >X</button>}

          </Header>
        {/* {currentRoom && !yourRoom && !room.userChannel ? ( */}
        {/* {currentRoom ? (
          <div className="controls">
            <button onClick={() => gotoRoom(room?._id, room)}>
              <Icon name="video" />

          </button>

          </div>)

          : null} */}

        {room?.activeUsers?.length !== 0 &&

          <List inverted id="active-users-list">
          {room?.activeUsers?.length ? (
            room?.activeUsers.map((x) => {
              if (x?.email == user?.email) {
              // style.backgroundColor = '#2b2b2b'
              style.color = '#4DAA57'
              style.textDecoration = 'none'
              style.fontSize = ".875rem"
              style.cursor = 'pointer'
            }





              return (<div key={x?.email}>

                <Participant participant={x} host={x?.email == user?.email} yourRoom={yourRoom} key={x?.email} gotoRoom={gotoRoom} />

              </div>
              )

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
      <div className="otherItem"></div>
    </div>
  )
}

export default function SideBar({ video }) {
  const { user, activeRooms, room, gotoRoom, posts, setStyle, style, query, className, setClassName, showSlider, setShowSlider, open, setOpen } = useContext(TheContext)

  // console.log("gottabe", posts)

  const sortedRooms = Object.values(posts)
    .filter(
      (x) =>
        ((x && x?.message.toLowerCase().includes(query.toLowerCase())) || //&& x.active && x.activeUsers.length) ||
          x?.id == 'lobby' ||
          x?.isLobby) && !x?.userChannel && !x?.dmChannel
      // (x) => (x.active && x.activeUsers.length) || x.id == 'lobby' || x.isLobby
  ).sort((a, b) => a?.active ? -1 : 1)

  const userChannels = []


  for (let channel of Object.values(posts)) {
    if (channel?.userChannel && !userChannels.some(c => c?._id == channel?._id) && channel?.message.toLowerCase().includes(query.toLowerCase())) {  //Unique user channels 
      userChannels.push(channel)
    }
  }


  const dmChannels = []

  for (let channel of Object.values(posts)) {
    if (channel?.dmChannel && channel?.members.includes(user._id) && !dmChannels.some(c => c._id == channel._id) && channel?.message.toLowerCase().includes(query.toLowerCase())) {  //Unique dm channels 
      dmChannels.push(channel)
    }
  }

  // console.log(userChannels, ' bb')
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

        
        <div className={`${showSlider ? 'show-slider' : 'hide-slider'}`} onClick={() => setShowSlider(false)}>


          {/*ROOMS */}
          <div id="rooms" className={open === 'rooms' ? `open` : 'closed'} onClick={() => setOpen('rooms')}>
            <h5 className="panelHeader"><span className="emojis">🏡</span> {sortedRooms.length} Public Room</h5>

            <ul className="scrollathon">
              <Link to='/new-question'><li id="newMessage"><Icon name="add" /> Public Room 🏡</li></Link>
              {sortedRooms?.length > 0 ? (sortedRooms?.map((room) => (
                <Room room={room} key={room?.id} />
            ))) : <h3>No Rooms Found </h3>}
            </ul>

          </div>

          {/*DMS */}
          <div id="direct-messages" className={open === 'direct-messages' ? `open` : 'closed'} onClick={() => setOpen('direct-messages')} >
           
            <h5 className="panelHeader"> <span className="emojis ">💬</span> {dmChannels?.length} Private Room</h5>
            <span >
              <ul className="scrollathon">
                <Link to='/new-message'><li id="newMessage"><Icon name="add" /> Private Room 💬</li></Link>


                {dmChannels?.length > 0 ? dmChannels?.map((room) => <Room room={room} key={room?.id} />) : <h3>No Messages Found</h3>}

            </ul>
            </span>

          </div>


          {/*USERS */}
          <div id="users" className={open === 'users' ? `open` : 'closed'} onClick={() => setOpen('users')} >
            <h5 className="panelHeader"> <span className="emojis ">🤯</span> {userChannels.length} Live Users </h5>
            <ul className="scrollathon">
              {userChannels.length > 0 ? userChannels.map((room) => <Room room={room} key={room.id} />) : <h3>No Users Found</h3>}
            </ul>
          </div>

        </div>

      </Sidebar>
      {/* <Chat /> */}

    </>
  )





}



