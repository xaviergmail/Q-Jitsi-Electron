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
  useLocation
} from 'react-router-dom'
import TheContext from './TheContext'
import { NavBar } from './components/NavBar'
import NotFound from './components/NotFound.js'
import CreateRoom from './components/CreateRoom'
import CallEnded from './components/CallEnded'
import Post from './components/Post'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import ReactLoading from 'react-loading'
import Room from './components/Room'
import SideBar from './components/SideBar'
import GoogleAuth from './components/GoogleAuth'
import VideoPreview from './components/VideoPreview/VideoPreview'
import Profile from './components/Profile'
import Chat from './components/Chat'
import NewMessage from './components/NewMessage'
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

// const socket = io(baseURL)


const { token } = localStorage;
console.log("DA TOKEN", token)

//Make connection to server just once on page load.
const socket = io(baseURL, {
  query: { token }
});

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
  let [clock, setClock] = useState(false)
  let [nConnections, setNConnections] = useState(0)
  const { pathname } = useLocation()

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
          console.log(newPosts, ' =-=-=-=', post, ' [][][]', newPosts[post?._id])
          newPosts[post?._id] = post
          //newPosts[post?.id].me
          return newPosts
        })

        const last = post.messageIds[post.messageIds.length - 1]
        console.log(last?.message, ' 444')
        console.log(last, user, post, 'good tunes')

        //Your message so don't notify
        if (last?.userId?._id == user._id && post.messageIds.length != 0) {
          return
        }


        //New Room - Message everyone
        if (post.messageIds.length === 0) {
          console.log('newRoom', last?.userId?.name, last?.message, last?.userId?.avatar)
          return notify(`🏡 ${post?.user?.name}`, post?.message, post?.user?.avatar)
        }


        //Direct Message - FIXME? 
        // if (last && last?.userId?._id != user._id && last?.postId != pathname.split('/').pop() && last?.message) {
        //   return notify(`💬 ${last?.userId?.name}`, last?.message, last?.userId?.avatar)
        // }

        //Message all members of a group DM unless the message came from yourself. 
        if (post && post?.members) {

          for (let member of post?.members) {
            console.log(member, user._id, member != user._id, 'fire')
            if (last?.message && member == user._id) {
              let icon = post.userChannel ? `🧐` : post.dmChannel ? `💬` : `🏡`
              return notify(`${icon} ${last?.userId?.name}`, last?.message, last?.userId?.avatar)
            }
          }
        }


      //

        //console.log(user, ' also', user._id, post?.user._id, post?.user._id != user._id, typeof user._id, typeof post?.user._id,)

        //If the host is present and you're not s/he then start making points 
        // if (post?.active && post?.hostPresent && post?.user._id != user._id) {
        //   console.log('start clock')
        //   setClock(true)
        // } else {
        //   setClock(false)
        // }

      },

      message: ({ message }) => {
        console.log(message, ' yoooooloooo')

      },


      event: ({ event }) => {
        console.log('event', event)
        let inTheRoom = event.participants.some((x) => x.email == user.email)//You are in this room 
        if (inTheRoom) {

          if (event.type === 'muc-occupant-joined' || event.type === 'muc-occupant-created') {
            if (event.post.user._id != user._id && event.post.hostPresent) { //You are not the host and the host is there. 
            //if (event.post.hostPresent) { //You are not the host and the host is there.
              console.log(event, ' crystal')
              setClock(true)
            }
          }
        } else {
          console.log("You aint in that room")
        }
        if (event.type === 'muc-occupant-left' || event.type === 'muc-occupant-destroyed') {

          if (event.user.email == user.email || (!event.post.hostPresent && inTheRoom)) { //I left or the host is not there and I'm in this room. 
            setClock(false)
          }
        }

      },

      encounter: (data) => {
      },

      liveUser: (data) => {
        console.log(data, 'liveUser')
        // let users = [...]
        setLiveUsers(data)
      },
      me: (data) => {
        console.log(data, ',meee')
        console.log(liveUsers)
        liveUsers[data._id] = data
        console.log(liveUsers)
      },
      totalConnections: ({ total }) => {
        console.log('total,', total)
        setNConnections(total)
      },

      transaction: ({ transaction, post, theUser }) => {
        if (!isMounted) {
          return
        }
        console.log(transaction, ' phillipines', post, theUser, user)

        // NotificationManager.info('Info message', `${transaction.email} has a transaction for ${transaction.amount} 💰`);

        _setMyTransactions(function (transactions) {
          //console.log(' dart board ', transactions)
          let newTransactions = [...transactions]
          newTransactions.push({ ...transaction, ...post })
          return newTransactions
        })

        if (user._id == theUser._id) {
          setUser(user)
        }


        if (transaction.kind === 'visit') {
          //Stop clock
          //setClock(false)
        }
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
    let user = await actions.getUser().catch(err => console.error(err, 'err'))
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
        if (res) {

          console.log('all posts', res.data)
          const postsById = {}
          for (let post of res.data) {
            postsById[post._id] = post
          }
          setPosts(postsById)
        }
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
  const [style, setStyle] = useState({ width: `${window.innerWidth / 4}px` })
  const [liveUsers, setLiveUsers] = useState({})
  const [showSlider, setShowSlider] = useState(false)
  // const [className, setStyle] = useState({ width: `${window.innerWidth / 4}px` })
  let [open, setOpen] = useState('rooms')

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
    setQuery,
    clock,
    setClock,
    nConnections,
    liveUsers,
    showSlider,
    setShowSlider,
    open, setOpen
  }
  window._context = context

  return user ? (
    <TheContext.Provider value={context}>
      <SideBar video={!isInRoomRoute && video} />
      <div style={style.container} className="container">
        <NavBar history={history} user={user} />

        <StackLayer style={{ overflow: 'hidden' }} className="style-3"

        >
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

              <Route path="/new-message" component={NewMessage} />

              <Route path="/settings" component={Settings} />
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


console.log('water')

function notify(title, message, icon) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var options = {
      body: message,
      // icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
      //icon: 'https://images.vexels.com/media/users/3/185580/isolated/preview/4481c0a89970cd7107424bb018900f2a-cool-hipster-pineapple-by-vexels.png'
      icon: icon.replace('svg', 'png')//`https://avatars.dicebear.com/4.5/api/avataaars/0.33511928838302496.png`
    }

    var notification = new Notification(title, options);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(message);
      }
    });
  }

  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them any more.
}

