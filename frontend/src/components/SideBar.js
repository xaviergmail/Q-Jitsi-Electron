import React, { useContext, useState, useEffect } from 'react'
import moment from 'moment'
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



              
const Room = ({ room, id }) => {

  const { gotoRoom, user, liveUsers, posts, setPosts } = useContext(TheContext)

  let count = room.messageIds.reduce((acc, cur) => { 
    if(cur.read){
      return !cur.read.includes(user._id) ? 1 + acc : 0
    }
  }, 0)
  // const [count, setCount] = useState()
  // // console.log(room.message, room.messageIds.reduce((acc, cur) => !cur.read.includes(user._id) ? 1 + acc : 0, 0), room)
  // useEffect(() => {
  //   setCount(room.messageIds.reduce((acc, cur) => !cur.read.includes(user._id) ? 1 + acc : 0, 0))
  // }, [room.messageIds])
  // console.log('ROOM', room, liveUsers, liveUsers.includes(room?.user?._id))
  const style = {}
  const yourRoom = room?.user?.email == user?.email
  const currentRoom = room?._id === location.hash.split('/').pop()
  if (currentRoom) {
    style.backgroundColor = '#2b2b2b'
    style.textDecoration = 'underline'
    // style.fontFamily = "Futura"
    style.borderRight = '20px solid rgb(43, 43, 43)'
  }


  const handleClick = () => {
    // console.log(posts, room._id, setPosts)
    let updatedPosts = { ...posts }
    updatedPosts[room._id].messageIds.forEach(message => {
      if (message.read != user._id && message.read) {
        message.read.push(user._id)
      }
    })
    setPosts(updatedPosts)
  }

  // let host = room.activeUsers.some(x => x.email == user.email)
  return (
    <div>
      <Link key={room._id} to={{ pathname: `/chat/${room?._id}`, state: room }}
        // onClick={() => setCount(0)}
        onClick={handleClick}
      >
      {/* onClick={() => gotoRoom(room.id, room)} */}

        <Menu.Item key={room._id} className="otherItem menu-item-sidebar" style={style} header>

        <Header key={room._id} as="h5" inverted>
            {/* } className={room?.activeUsers?.length !== 0 && 'liveUser'} */}
            <span className={
              (room.userChannel && liveUsers.includes(room?.user?._id) || room?.activeUsers?.length !== 0) ? "liveUser" : null}>{room?.message}</span>
            {/* {room?.activeUsers.length !== 0 && <span className='activeUsers'>{room?.activeUsers?.length}</span>} */}

            {count ?
              <span className='badges'>
                <span></span>
                <span className='messageCount'>  {count} </span>

              </span> : null
            }



            {/* <i>{moment(room.updatedAt).fromNow()}</i> */}
            
        {yourRoom && <button className="close-room" onClick={() => console.log('Send everyone to lobby')} >X</button>}

          </Header>


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

export default function SideBar({ video, littleVideo, isInRoomRoute }) {
  let [limit, setLimit] = useState(50)

  let [slide, setSlide] = useState(false)

  const { user, activeRooms, room, gotoRoom, posts, liveUsers, setStyle, style, query, className, setClassName, showSlider, setShowSlider, open, setOpen } = useContext(TheContext)


  const sortedRooms = Object.values(posts)
    .filter((x) => ((x && x?.message.toLowerCase().includes(query.toLowerCase()))) && !x?.userChannel && !x?.dmChannel
  ).sort((a, b) => a?.active ? -1 : 1).slice(0, limit)


  let sortedCount = sortedRooms.reduce((acc, rm) => {
    let eachCount = rm.messageIds.reduce((acc, eachMg) => {
      if (eachMg.read && !eachMg.read.includes(user._id)) {
        return acc + 1
      } else {
        return acc + 0
      }
    }, 0)
    return acc + eachCount
  }, 0)


  // const userChannels = []

  // for (let channel of Object.values(posts)) {
  //   if (
  //     channel?.userChannel && 
  //     !userChannels.some(c => c?._id == channel?._id) && 
  //     channel?.message.toLowerCase().includes(query.toLowerCase()) && 
  //     channel.user?._id !== user?._id
  //   ) {  //Unique user channels 
  //     userChannels.push(channel)
  //   }
  // }
  const userChannels = []

  for (let channel of Object.values(posts)) {
    if (channel?.userChannel) {  //Unique user channels 
      userChannels.push(channel)
    }
  }

  const dmChannels = []

  for (let channel of Object.values(posts)) {
    if (channel?.dmChannel && channel?.members.includes(user._id) && !dmChannels.some(c => c._id == channel._id) && channel?.message.toLowerCase().includes(query.toLowerCase())) {  //Unique dm channels 
      dmChannels.push(channel)
    }
  }
  let dmChannelCount = dmChannels.reduce((acc, rm) => {
    let eachCount = rm.messageIds.reduce((acc, eachMg) => {
      if (eachMg.read && !eachMg.read.includes(user._id)) {
        return acc + 1
      } else {
        return acc + 0
      }
    }, 0)
    return acc + eachCount
  }, 0)


  if (window.jitsiNodeAPI) {
    let count = sortedCount + dmChannelCount
    window.jitsiNodeAPI.ipc.send('set-counter', { count })
  }
  console.log(window)
  // {path: "/room/:id", url: "/room/60ce707725c93448a526d659", isExact: true, params: {…}}
  // isExact: true
  // params: {id: "60ce707725c93448a526d659"}
  // path: "/room/:id"
  // url: "/room/60ce707725c93448a526d659"

  console.log('video', video, 'littleVideo', littleVideo, video.isPlaying, ' maybe')
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
        // onClick={!slide ? () => setSlide(true) : null}
      className="style-3"
      visible
        // style={style.sideBar}
        // style={slide ? { width: '25vw' } : { width: '100vw' }}
    >
        <Search setStyle={setStyle} setClassName={setClassName} className={className} />
        {video}

        
        <div className={`${showSlider ? 'show-slider' : 'hide-slider'}`} onClick={() => setShowSlider(false)}>
          <div className={littleVideo ? 'littleVideo' : ''}>

          {/*ROOMS */}
            <div id="rooms" className={open === 'rooms' ? `open` : 'closed'} onClick={() => setOpen('rooms')} >
            <h5 className="panelHeader">
              <span className="emojis">🏡</span>
              <span>Public Chats</span>
              <span className="badges">
                <span className="messageCount">
                  {sortedCount}
                </span>

                <span className="activeRooms">
                {sortedRooms.reduce((acc, room) => {
                  return room?.activeUsers?.length || 0 + acc
                }, 0)
                }
                </span>

              </span>

            </h5>

            <ul className="scrollathon">
              <Link to='/new-question'><li id="newMessage"><Icon name="add" /></li></Link>
              {sortedRooms?.length > 0 ? (sortedRooms?.map((room) => (
                <Room room={room} key={room?.id} />
            ))) : <h3>No Rooms Found </h3>}
              {/* {limit < 99 ?
                < Menu.Item onClick={() => setLimit(100)}>Show More ({sortedRooms?.length - limit})</Menu.Item>
                : null} */}

            </ul>


          </div>

          {/*DMS */}
          <div id="direct-messages" className={open === 'direct-messages' ? `open` : 'closed'} onClick={() => setOpen('direct-messages')} >
           
            <h5 className="panelHeader">
              {/* <span className="emojis">💬</span>
              <span>Private Channels</span>
              <span className="activeRooms">
                {dmChannels.length}
              </span> */}
              <span className="emojis">💬</span>
              <span>Private Chats</span>

              <span className="badges">
                <span className="messageCount">
                  {dmChannelCount}
                </span>

                <span className="activeRooms">
                  {dmChannels.reduce((acc, room) => {
                    return room?.activeUsers?.length || 0 + acc
                  }, 0)
                  }
                </span>

              </span>

            </h5>
             <span >
              <ul className="scrollathon">
                <Link to='/new-message'><li id="newMessage"><Icon name="add" /></li></Link>


                {dmChannels?.length > 0 ? dmChannels?.map((room) => <Room room={room} key={room?.id} />).slice(0, limit) : <h3>No Messages Found</h3>}
                {/* {limit < 99 ?
                  < Menu.Item onClick={() => setLimit(100)}>Show More ({dmChannels?.length - limit})</Menu.Item>
                  : null} */}
            </ul>
            </span>

          </div>


          {/*USERS */}
          <div id="users" className={open === 'users' ? `open` : 'closed'} onClick={() => setOpen('users')} >
            <h5 className="panelHeader">
              <span className="emojis">🤯</span>
              <span>Users</span>

              <span className="badges">
                <span></span>
                <span className="activeRooms">{liveUsers.length}</span>
              </span>
            </h5>


            {/* <h5 className="panelHeader"> <span className="emojis ">🤯</span> {userChannels.length} Total Users | {liveUsers.length} Live </h5> */}
            <ul className="scrollathon">

              {userChannels.length > 0 ? userChannels.map((room) => <Room room={room} key={room.id} />).slice(0, limit) : <h3>No Users Found</h3>}


              {console.log(liveUsers, ' float on', userChannels)}
              {/* {liveUsers.length > 0 ? liveUsers.map((room) => <Room room={room} key={room.id} />).slice(0, limit) : <h3>No Users Found</h3>} */}


            </ul>
          </div>

        </div>
        </div>
      </Sidebar>
      {/* <Chat /> */}

    </>
  )





}



