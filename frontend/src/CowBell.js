import Logger from 'jitsi-meet-logger'

var logger = Logger.getLogger()

Logger.setLogLevel(Logger.levels.WARN)

Logger.level = 0

import React, { Fragment, useState, useEffect, useMemo, createRef, useContext } from 'react'
import {
  Switch,
  Route,
  NavLink,
  useHistory,
  Link,
  HashRouter,
  useRouteMatch,
} from 'react-router-dom'
import TheContext from './TheContext'
import { NavBar } from './components/NavBar'
import NotFound from './components/NotFound.js'
import CreateRoom from './components/CreateRoom'
import CallEnded from './components/CallEnded'
import Post from './components/Post'
import Dashboard from './components/Dashboard'
import ReactLoading from 'react-loading'
import Room from './components/Room'
import SideBar from './components/SideBar'

import 'react-notifications/lib/notifications.css'
import 'semantic-ui-css/semantic.min.css'
import './index.css'

import actions from './api/index'
import { NotificationContainer /*NotificationManager */ } from 'react-notifications'
import io from 'socket.io-client'

//Make connection to server just once on page load.
import baseURL from './api/config'

// TODO: Convert this into a reusable useSocket or something
let _setPosts = function () {}

import styled from 'styled-components'

const StackLayer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

const Stacked = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`

function VideoBottomRight() {
  const [stream, setStream] = useState()
  const [transform, setTransform] = useState()
  const [hasVideo, setHasVideo] = useState(false)

  const { room, gotoRoom } = useContext(TheContext)


  const ref = createRef()

  useEffect(() => {
    const api = window.jitsiMeetExternalAPI

    if (api) {
      const listeners = {
        speakerChanged: (evt) => {
          const largeVideo = api._getLargeVideo()
          setHasVideo(largeVideo)
          setStream(largeVideo?.srcObject)
          setTransform(largeVideo?.style?.transform)
        },

      }

      listeners.speakerChanged()

      for (const [k, v] of Object.entries(listeners)) {
        api.on(k, v)
      }

      return () => {
        if (api && typeof api.removeListeners == "function") {
          for (const [k, v] of Object.entries(listeners)) {
            api.removeListeners(k, v)
          }
        }
      }
    }
  }, [window.jitsiMeetExternalAPI])

  useEffect(() => {
    ref.current.srcObject = stream
    ref.current.style.transform = transform
    ref.current.play()
  }, [stream, transform])

  console.log('stream', stream)

  return (
    <video
      className="videobottomright"
      autoPlay=""
      id="video"
      ref={ref}
      style={{ transform: 'none', display: hasVideo ? 'block' : 'none', cursor: 'pointer' }}
      muted
      onClick={() => gotoRoom(room)}
    ></video>
  )
}

const socket = io(baseURL)
socket.on('post', (post) => {
  console.log('post', post, ' kiwi')
  _setPosts(function (posts) {
    let newPosts = { ...posts }
    newPosts[post.id] = post
    return newPosts
  })
})

console.log(socket, ' to me ', baseURL)

const MemoizedRoom = React.memo(
  function ({ room, children }) {
    console.log('RECREATING ROOM IFRAME!', room, children)
    return <Room roomId={room} jitsiApp={children} />
  },
  (a, b) => a.room == b.room
)

//require('devtron').install()
//require('react-devtools-electron').install()
function PersistentRoom(room, children) {
  if (room) {
    return <MemoizedRoom {...{ room, children }} />
  }
}

function isValidRoom(room) {
  if (room && room != 'undefined' && room != '"undefined"') {
    return room
  }
}

const CowBell = ({ children }) => {
  let [user, setUser] = useState(null)
  let [posts, setPosts] = useState({})
  _setPosts = setPosts

  const isInRoomRoute = useRouteMatch('/room/:id')
  const routeRoom = isValidRoom(isInRoomRoute?.params?.id)
  let [room, setRoom] = useState(routeRoom)

  if (isInRoomRoute) {
    if (room != routeRoom) {
      setRoom(routeRoom)
    }
    room = routeRoom
  }

  const history = useHistory()
  
  useEffect(() => {
    const api = window.jitsiMeetExternalAPI
    if (api) {
      const listeners = {
        log: (evt) => {
          evt.preventDefault()
        },

        readyToClose: (evt) => {
          gotoRoom(null)
        },
      }

      for (const [k, v] of Object.entries(listeners)) {
        api.on(k, v)
      }

      return () => {
        if (api && typeof api.removeListeners == "function") {
          for (const [k, v] of Object.entries(listeners)) {
            api.removeListeners(k, v)
          }
        }
      }
    }
  }, [window.jitsiMeetExternalAPI, history])
  
  console.log('CURRENT ROOM', room)

  function gotoRoom(id) {
    if (id) {
      history.push(`/room/${id}`)
      setRoom(id)
    } else {
      history.push(`/create-room`)
      setRoom(null)
    }
  }

  const roomElement = PersistentRoom(room, children)

  const [jwt, setJwt] = useState(localStorage.getItem('token'))
  let [loadingUser, setLoadingUser] = useState(jwt != null)

  async function getUser() {
    let user = await actions.getUser()
    console.log('user is', user?.data.name)
    if (user) {
      setUser(user?.data)
    }
    setLoadingUser(false)
  }

  async function updateToken(evt, resp) {
    const token = JSON.parse(resp)
    const user = await actions.logIn(token.id_token)
    setUser(user?.data)
  }

  function reauth() {
    window.jitsiNodeAPI.ipc.send('gauth-rq')
  }

  // useEffect(() => console.log('a'), [])
  // useEffect(() => console.log('b'), [])

  useEffect(() => {
    window.jitsiNodeAPI.ipc.on('gauth-tk', updateToken) // send notification to main process

    if (!jwt) {
      const googleToken = localStorage.getItem('googletoken')
      if (!googleToken) {
        setTimeout(function () {
          reauth()
        }, 1000)
      } else {
        actions.logIn(googleToken).then(function (user) {
          setUser(user?.data)
        })
      }
    }
  }, [])

  useEffect(() => {
    if (jwt && !user) {
      getUser() //.then(() => {})
    }

    actions
      .getAllPosts()
      .then((res) => {
        const postsById = {}
        for (let post of res.data) {
          postsById[post.id] = post
        }
        setPosts(postsById)
      })
      .catch((err) => console.error(err))
  }, [jwt, user])

  const logOut = async () => {
    await actions.logOut()
    setUser(null)
  }

  Logger.setLogLevel(Logger.levels.WARN)
  Logger.level = 0

  const activeRooms = Object.values(posts).filter(
    (x) => (x.active && x.activeUsers.length) || x.id == 'lobby' || x.isLobby
  )

  const video = <VideoBottomRight />

  const context = { history, user, setUser, posts, jwt, activeRooms, room, gotoRoom }
  window._context = context

  return user ? (
    <TheContext.Provider value={context}>
      <SideBar video={!isInRoomRoute && video} />
      <div className="container">
        <NavBar history={history} />
        <StackLayer>
          <Stacked className="room" style={{ display: room && isInRoomRoute ? 'block' : 'hidden' }}>
            {roomElement}
          </Stacked>

          <Stacked style={{ background: 'white', display: isInRoomRoute ? 'none' : 'block' }}>
            <Switch>
              <Route exact path="/dashboard" component={Dashboard} />

              <Route exact path="/create-room" component={CreateRoom} />

              <Route exact path="/call-ended" component={CallEnded} />

              <Route path="/post/:id" render={(props) => <Post {...props} user={user} />} />

              <Route path="/room/:roomName" render={(props) => <div></div>} />

              {/* <Route path="/room/:roomName" render={(props) => <JitsiRoom {...props} />} /> */}

              <Route component={NotFound} />
            </Switch>
          </Stacked>
        </StackLayer>
      </div>

      <NotificationContainer />
    </TheContext.Provider>
  ) : jwt == null ? (
    <ReactLoading type="bars" color="rgb(0, 117, 255)" height="128px" width="128px" />
  ) : (
    <p>
      Please sign in through google using the popup window. <a onClick={reauth}>Click here</a> if
      the window did not open.
    </p>
  )
}

export default function CowBellWithRouter(props) {
  return (
    <HashRouter>
      <CowBell {...props} />
    </HashRouter>
  )
}
