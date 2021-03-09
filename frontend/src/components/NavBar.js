import React, { useEffect, useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Image } from 'semantic-ui-react'
import TheContext from '../TheContext'
export function NavBar({ user }) {
  const { pathname } = useLocation()
  console.log('location', pathname)
  return (
    <Menu pointing secondary className="top-nav">
      <Link to="/create-room" id="create">
        <Menu.Item link active={pathname == '/create-room'}>
          Create a Room ＋
        </Menu.Item>
      </Link>

      <Link to="/profile">
        <Menu.Item link active={pathname == '/profile'}>
          <Image avatar src={user.avatar} style={{ background: "white" }} />
          {user ? user.name : `Profile`}

        </Menu.Item>
      </Link>


      <Link id="points" to="/dashboard">
        <Menu.Item link active={pathname == '/dashboard'}>
          {user.points.toFixed(0)} 💰
        </Menu.Item>
      </Link>


    </Menu>


  )
}
