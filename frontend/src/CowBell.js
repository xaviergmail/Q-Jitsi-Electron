// import Logger from 'jitsi-meet-logger'

// var logger = Logger.getLogger()

// Logger.setLogLevel(Logger.levels.WARN)

// Logger.level = 0

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
import GoogleAuth from './components/GoogleAuth'
import VideoPreview from './components/VideoPreview/VideoPreview'
import Profile from './components/Profile'
import Chat from './components/Chat'
import Search from './components/Search'

import 'react-notifications/lib/notifications.css'
import 'semantic-ui-css/semantic.min.css'
import './index.css'

import actions from './api/index'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import io from 'socket.io-client'

//Make connection to server just once on page load.
import baseURL from './api/config'

// TODO: Convert this into a reusable useSocket or something
let _setPosts = function () { }
let _setMyTransactions = function () { }

//Styled components && semantic UI ?? WUT
import styled from 'styled-components'
import JitsiRoom from './components/JitsiRoom'

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

const socket = io(baseURL)

console.log(socket, ' to me ', baseURL)

const MemoizedRoom = React.memo(
  function ({ room, children }) {
    //console.log('RECREATING ROOM IFRAME!', room, children)
    if (window.jitsiNodeAPI) {
      //If its electron
      return <Room roomId={room} jitsiApp={children} />
    } else {
      return <JitsiRoom roomName={room} />
    }
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
  let [myPosts, setMyPosts] = useState([])
  let [myTransactions, setMyTransactions] = useState([])
  let [posts, setPosts] = useState([])
  let [query, setQuery] = useState('')


  _setPosts = setPosts
  _setMyTransactions = setMyTransactions

  const isInRoomRoute = useRouteMatch('/room/:id')
  const routeRoom = isValidRoom(isInRoomRoute?.params?.id)
  // let [room, setRoom] = useState(routeRoom || "lobby")

  let [room, setRoom] = useState(routeRoom || null)

  const history = useHistory()

  if (isInRoomRoute) {
    if (room != routeRoom) {
      setRoom(routeRoom)
    }
    room = routeRoom
  }



  /**WUT  -- Sends all users to lobby if host leaves room?**/
  if (posts[room] && !posts[room].active) {

  }


  useEffect(() => {
    const api = window.jitsiMeetExternalAPI
    let isMounted = true
    let listeners = {}
    if (api) {
      listeners = {
        log: (evt) => {
          evt.preventDefault()
        },

        readyToClose: (evt) => {
          // console.log(evt, 'readyToClose', location, history, ' 9')
          history.goBack()
          //gotoRoom("lobby")
        },
      }

      for (const [k, v] of Object.entries(listeners)) {
        api.on(k, v)
      }
    }

    const socketEvents = {
      lobby: (email) => {
        if (!isMounted) {
          return
        }

        if (email === user?.email) {
          window.jitsiMeetExternalAPI.executeCommand('hangup')
        }
      },

      post: ({ post }) => {
        if (!isMounted) {
          return
        }

        console.log('post', post, ' kiwi')
        _setPosts(function (posts) {
          let newPosts = { ...posts }
          newPosts[post?.id] = post
          return newPosts
        })
      },

      message: ({ message }) => {
        console.log(message, ' yoooooloooo')

      },

      transaction: ({ transaction, post }) => {
        if (!isMounted) {
          return
        }
        console.log(transaction, ' phillipines', post)

        // NotificationManager.info('Info message', `${transaction.email} has a transaction for ${transaction.amount} 💰`);

        _setMyTransactions(function (transactions) {
          //console.log(' dart board ', transactions)
          let newTransactions = [...transactions]
          newTransactions.push({ ...transaction, ...post })
          return newTransactions
        })
      },
    }

    for (const [k, v] of Object.entries(socketEvents)) {
      socket.on(k, v)
      //console.log("RESGISNETING EWOSCKET '", k)
    }

    return () => {
      isMounted = false

      if (api && typeof api.removeListener == 'function') {
        for (const [k, v] of Object.entries(listeners)) {
          api.removeListener(k, v)
        }
      }

      for (const [k, v] of Object.entries(socketEvents)) {
        socket.removeListener(k, v)
      }
    }
  }, [window.jitsiMeetExternalAPI, history, socket, user, room])

  // console.log('CURRENT ROOM', room)

  function gotoRoom(id, room) {

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
    if (window.jitsiNodeAPI) {
      //electron
      window.jitsiNodeAPI.ipc.send('gauth-rq') // send notification to main process
    }
  }

  // useEffect(() => console.log('a'), [])
  // useEffect(() => console.log('b'), [])

  useEffect(() => {
    if (window.jitsiNodeAPI) {
      //electron
      window.jitsiNodeAPI.ipc.on('gauth-tk', updateToken) //Event listener for when google Auth logs ypu in.
    }
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

      //Possibly combine getUser with below using populate

      //I thought this would be more efficient but i'm having issue WUT
      // actions
      //   .getMyTransactions()
      //   .then((res) => {
      //     setMyTransactions(res.data)
      //   })
      //   .catch((err) => {
      //     console.log(err)
      //   })

      // actions
      //   .getMyPosts()
      //   .then(res => {
      //     setMyPosts(res.data)
      //   }).catch((err) => {
      //     console.log(err)
      //   })
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

  // Logger.setLogLevel(Logger.levels.WARN)
  // Logger.level = 0

  const filterRooms = (query) => {

    setQuery(query)
  }

  const activeRooms = Object.values(posts).filter(
    (x) =>
      (x.message.toLowerCase().includes(query.toLowerCase()) && x.active && x.activeUsers.length) ||
      x.id == 'lobby' ||
      x.isLobby
    // (x) => (x.active && x.activeUsers.length) || x.id == 'lobby' || x.isLobby
  )

  const lobby_id = Object.values(posts).find(room => room.id === 'lobby')?._id

  const video = <VideoPreview />
  

  let [bounty, setBounty] = useState(10)
  const [style, setStyle] = useState({ width: "250px" })


  const context = {
    history,
    user,
    setUser,
    posts,
    jwt,
    activeRooms,
    room,
    gotoRoom,
    setMyPosts,
    myPosts,
    setMyTransactions,
    myTransactions,
    socket,
    lobby_id,
    filterRooms,
    bounty,
    setBounty,
    style,
    setStyle,
    query,
    setQuery
  }
  window._context = context

  return user ? (
    <TheContext.Provider value={context}>
      <SideBar video={!isInRoomRoute && video} />
      <div className="container">
        <NavBar history={history} user={user} />

        <StackLayer style={{ overflow: 'hidden' }} onClick={() => setStyle({ width: '250px' })}>
          <Stacked className="room" style={{ display: room && isInRoomRoute ? 'block' : 'hidden' }}>
            {roomElement}
          </Stacked>

          <Stacked
            style={{
              overflow: 'auto',
              background: 'white',
              display: isInRoomRoute ? 'none' : 'block',
            }}
          >
            <Switch>
              {/* <Route exact path="/" render={(props) => <div>WUT</div>} /> */}
              <Route exact path="/" render={(props) => history.push(`/chat/${lobby_id}`)} />

              <Route exact path="/dashboard" component={Dashboard} />

              {/* <Route exact path="/create-room" component={CreateRoom} /> */}

              <Route exact path="/call-ended" component={CallEnded} />

              <Route path="/post/:id" render={(props) => <Post {...props} user={user} />} />

              <Route path="/profile" component={Profile} />

              <Route path="/chat/:id" component={Chat} />

              {/**WUT**/}
              <Route path="/room/:roomName" render={(props) => <div>HMMMMM</div>} />

              {/* <Route path="/room/:roomName" render={(props) => <JitsiRoom {...props} />} /> */}

              <Route component={NotFound} />
            </Switch>
          </Stacked>
        </StackLayer>
        {/* <Search /> */}

      </div>


      <NotificationContainer />
    </TheContext.Provider>
  ) : jwt ? (
    <ReactLoading type="bars" color="rgb(0, 117, 255)" height="128px" width="128px" />
  ) : window.jitsiNodeAPI ? (
    <p>
      Please sign in through google using the popup window. <a onClick={reauth}>Click here</a> if
      the window did not open.{' '}
    </p>
  ) : (
    <p>
      <GoogleAuth setJwt={setJwt} />{' '}
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
