import React, { useEffect, useState, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import TheContext from '../TheContext'
export function NavBar() {
  const { pathname } = useLocation()
  console.log('location', pathname)
  return (
    <Menu pointing secondary>
      <Link to="/profile">
        <Menu.Item link active={pathname == '/profile'}>
          Profile
        </Menu.Item>
      </Link>

      <Link to="/dashboard">
        <Menu.Item link active={pathname == '/dashboard'}>
          Dashboard
        </Menu.Item>
      </Link>
    </Menu>
  )
}
