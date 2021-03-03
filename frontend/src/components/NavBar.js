import React, { useEffect, useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import TheContext from '../TheContext'
export function NavBar() {
  const { pathname } = useLocation()
  console.log('location', pathname)
  return (
    <Menu pointing secondary>
      <Link to="/create-room">
        <Menu.Item link active={pathname == '/create-room'}>
          Create a Room
        </Menu.Item>
      </Link>

      <Link to="/dashboard">
        <Menu.Item link active={pathname == '/dashboard'}>
          Profile
        </Menu.Item>
      </Link>
    </Menu>
  )
}
