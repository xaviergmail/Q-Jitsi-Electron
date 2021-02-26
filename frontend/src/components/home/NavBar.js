import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Checkbox,
  Grid,
  Header,
  Icon,
  Image,
  Menu,
  Segment,
  Sidebar,
} from 'semantic-ui-react'
export function NavBar({children, setVisible, visible, history}) {
  // const [visible, setVisible] = React.useState(false)


  let [t, setT] = useState(false)


  window.onmousemove = e => {
      if (!visible) {
          //make show
          setTimeout(function () {
            setVisible(true)
          }, 0)

      } else {
          //do nothing
          clearTimeout(t)
          t = setTimeout(function () {
            setVisible(false)
          }, 2000)
          setT(t)

      }
  }


  return (
    <Grid columns={1}>

        <nav>
          <div>
          <Link to="#" onClick={() => history.goBack()}>Back</Link>  
          </div>
          <div>
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/dashboard">Dashboard</Link>
          </div>
        </nav>
        {/* <Checkbox
          checked={visible}
          label={{ children: <code>visible</code> }}
          onChange={(e, data) => setVisible(data.checked)}
        /> */}
      

      <Grid.Column
        // onMouseEnter={() => setVisible(true)} 
        // onMouseEnter={() => setVisible(true)} 
        // onMouseLeave={() => setTimeout(() => setVisible(false), 1000)} 
      >
        <Sidebar.Pushable as={Segment}>
          <Sidebar
          
            as={Menu}
            animation='overlay'
            icon='labeled'
            inverted
            onHide={() => setVisible(false)}
            vertical
            visible={visible}
            width='thin'
          >
            <Menu.Item as='a'>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='gamepad' />
              Games:)
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='camera' />
              Channels
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='gamepad' />
              Games:)
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='camera' />
              Channels
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='gamepad' />
              Games:)
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='camera' />
              Channels
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='gamepad' />
              Games:)
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='camera' />
              Channels
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='gamepad' />
              Games:)
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='camera' />
              Channels
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher dimmed={false}>
            <Segment basic>
              {children}
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </Grid.Column>
    </Grid>
  )
}
