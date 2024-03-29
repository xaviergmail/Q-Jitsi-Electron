import React, { useEffect, useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Image, Icon } from 'semantic-ui-react'
import Search from './Search'
import TheContext from '../TheContext'
import SideBar from './SideBar'
import { version } from '../../../package.json'
console.log(version, ' version number: ', process);

// sound.play(path.join(__dirname, "resources/cowbell.wav"))


export function NavBar({ user }) {
  const { pathname } = useLocation()
  const { activeRooms, room, gotoRoom, history, lobby_id, bounty, clock, nConnections } = useContext(TheContext)


  let [increment, setIncrement] = useState(0)
  let [int, setInt] = useState(null)

  useEffect(() => {
    //console.log(clock, ' ! ')
    let incPoints = null
    if (clock) {
      //console.log('count!')
      incPoints = setInterval(() => {
        setIncrement(++increment)
        if (increment === 1) {
          let audio = new Audio('../resources/coin.wav')
          audio.volume = 0.1;
          audio.play()
        }



      }, 10000)

    } else {
      clearInterval(incPoints)
    }

    return () => clearInterval(incPoints)
  }, [clock])
  // console.log('location', pathname)
  // <Menu pointing secondary 
  // console.log('video room==>', room)
  // console.log('chat room ==> ', pathname.split('/').pop() === lobby_id ? 'lobby' : pathname)

  return (<>

    <nav className="top-nav">


      <div className="links">
        <div id="back" onClick={history.goBack}>
          <Icon name="arrow left" />
          <span id="address">{pathname.split('/').pop() === lobby_id ? 'lobby' : pathname}</span>
        </div>
        <div id="back" onClick={() => location.reload()}>
          <Icon name="refresh" />
        </div>



        <h1 id="logo" onClick={() => history.push(`/chat/${lobby_id}`)}><span className="farm emojis">🐮</span> CowBell <sub>{version}</sub></h1>
        {/*}.repeat(nConnections)} {nConnections}*/}
        {/* <Link to="/chat">
          <Menu.Item link active={pathname == '/chat'}>
            Chat
        </Menu.Item>
        </Link> */}
        {/* </div>

      <Search /> 

      <div className="links"> */}



        <Link id="points" to="/dashboard">
          <Menu.Item link active={pathname == '/dashboard'}>
            <span className="emojis" id={increment === 1 ? "coin-animate" : ''}>💰</span>{(user.points - bounty + increment).toFixed(0)}
          </Menu.Item>
        </Link>

        <Link to="/profile">
          <Menu.Item link active={pathname == '/profile'}>
            <Image avatar src={user.avatar} style={{ background: "white" }} />
            {user ? user.name : `Profile`}

          </Menu.Item>
        </Link>

      </div>


    </nav>
    {/* <SideBar />
    <ul id="roomBah">
      {activeRooms.map((room) => (
        // <Room room={room} key={room.id} />
        <li>{room._id}</li>
      ))}
    </ul>

    <div> How about here? </div> */}

  </>
  )
}


