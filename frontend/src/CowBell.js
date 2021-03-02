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
import Home from './components/Home'
import { NavBar } from './components/NavBar'
import NotFound from './components/NotFound.js'
import Profile from './components/Profile'
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
  
  const api = window.jitsiMeetExternalAPI

  const ref = createRef()

  useEffect(() => {
    if (api) {
      const speakerChanged = (evt) => {
        const largeVideo = api._getLargeVideo()
        setHasVideo(largeVideo)
        setStream(largeVideo?.srcObject)
        setTransform(largeVideo?.style?.transform)
      }
      speakerChanged()

      api.on('largeVideoChanged', speakerChanged)
      return () => {
        api.removeListener('largeVideoChanged', speakerChanged)
      }
    }
  }, [api])

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
    newPosts[post._id] = post
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

const CowBell = ({ children }) => {
  let [user, setUser] = useState(null)
  let [posts, setPosts] = useState({})
  _setPosts = setPosts

  const isInRoomRoute = useRouteMatch('/room/:id')
  const routeRoom = isInRoomRoute?.params?.id
  let [room, setRoom] = useState(routeRoom)

  if (isInRoomRoute) {
    if (room != routeRoom) {
      setRoom(routeRoom)
    }
    room = routeRoom
  }

  console.log('CURRENT ROOM', room)

  const history = useHistory()

  function gotoRoom(id) {
    history.push(`/room/${id}`)
    setRoom(id)
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
          postsById[post._id] = post
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

  const activeRooms = Object.values(posts).filter((x) => x.active)

  const video = <VideoBottomRight />

  return (
    <TheContext.Provider
      value={{ history, user, setUser, posts, jwt, activeRooms, room, gotoRoom }}
    >
      <SideBar video={!isInRoomRoute && video} />
      <div className="container">
        <NavBar history={history} />
        <StackLayer>
          <Stacked className="room" style={{ display: room && isInRoomRoute ? 'block' : 'hidden' }}>
            {roomElement}
          </Stacked>

          <Stacked style={{ background: 'white', display: isInRoomRoute ? 'none' : 'block' }}>
            {jwt == null ? (
              <ReactLoading type="bars" color="rgb(0, 117, 255)" height="128px" width="128px" />
            ) : (
              <>
                {user && (
                  <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/dashboard" component={Dashboard} />

                    <Route exact path="/profile" component={Profile} />

                    <Route path="/post/:id" render={(props) => <Post {...props} user={user} />} />

                    <Route path="/room/:roomName" render={(props) => <div></div>} />

                    {/* <Route path="/room/:roomName" render={(props) => <JitsiRoom {...props} />} /> */}

                    <Route component={NotFound} />
                  </Switch>
                )}

                {!user && (
                  <p>
                    Please sign in through google using the popup window.{' '}
                    <a onClick={reauth}>Click here</a> if the window did not open.
                  </p>
                )}
              </>
            )}
          </Stacked>
        </StackLayer>
      </div>

      <NotificationContainer />
    </TheContext.Provider>
  )
}

export default function CowBellWithRouter(props) {
  return (
    <HashRouter>
      <CowBell {...props} />
    </HashRouter>
  )
}
