import React, { useEffect, useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Image, Icon } from 'semantic-ui-react'
import Search from './Search'
import TheContext from '../TheContext'
import SideBar from './SideBar'


export function NavBar({ user }) {
  const { pathname } = useLocation()

  const { activeRooms, room, gotoRoom, history, lobby_id, bounty } = useContext(TheContext)
  // console.log('location', pathname)
  // <Menu pointing secondary 
  console.log('1b1b1b', room)
  return (<>
    <nav className="top-nav">


      <div className="links">
        <div id="back" onClick={history.goBack}>
          <Icon name="arrow left" />
          <span id="address">{pathname.split('/').pop() === lobby_id ? 'lobby' : pathname}</span>
        </div>


        <h1 id="logo" onClick={() => history.push('/')}>CowBell!?!?!?</h1>
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
            <span id="cash">💰</span>{(user.points - bounty).toFixed(0)}
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


