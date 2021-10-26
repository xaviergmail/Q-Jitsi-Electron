

import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import { NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import {
  HashRouter, Route, Switch, useHistory, useLocation, useRouteMatch
} from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css'
import io from 'socket.io-client'
//Styled components && semantic UI ?? WUT
import styled from 'styled-components'
//Make connection to server just once on page load.
import baseURL from './api/config'
import actions from './api/index'
import CallEnded from './components/CallEnded'
import Chat from './components/Chat'
import Dashboard from './components/Dashboard'
import GoogleAuth from './components/GoogleAuth'
import JitsiRoom from './components/JitsiRoom'
import { NavBar } from './components/NavBar'
import NewMessage from './components/NewMessage'
import NewQuestion from './components/NewQuestion'
import NotFound from './components/NotFound.js'
import Post from './components/Post'
import Profile from './components/Profile'
import Room from './components/Room'
import Settings from './components/Settings'
import SideBar from './components/SideBar'
import User from './components/User'
import VideoPreview from './components/VideoPreview/VideoPreview'
import './index.css'
import TheContext from './TheContext'
import './threedots.css'



const remote = require('electron').remote;


const win = remote.getCurrentWindow();
console.log(remote, win)



// TODO: Convert this into a reusable useSocket or something
let _setPosts = function () { }
let _setMyTransactions = function () { }
let _posts = []


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

//Make connection to server just once on page load.
// const socket = io()


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

  // console.log('cool yeah i should do it', posts)


  _setPosts = setPosts
  _posts = posts
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
  const lobby_id = Object.values(posts).find(room => room?.id === 'lobby')?._id


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


      deletePost: ({ post }) => {
        _setPosts(function (posts) {
          let newPosts = { ...posts }

          delete newPosts[post._id]
          return newPosts
        })

        if (window.location.hash.split('/').pop() == post._id) { //You're in the closed room
          history.push(`/profile`)
        }
      },

      post: ({ post }) => {
        if (!isMounted) {
          return
        }

        console.log('post:', post, ' kiwi')
        const [yourBrowserWindow] = remote.BrowserWindow.getAllWindows();
        console.log(yourBrowserWindow.isFocused(), ' in focused');

        _setPosts(function (posts) {
          let newPosts = { ...posts }
          // console.log(newPosts, ' =-=-=-=', post, ' [][][]', newPosts[post?._id])
          newPosts[post?._id] = post
          //newPosts[post?.id].me
          return newPosts
        })

        const last = post?.messageIds[post.messageIds.length - 1]
        // console.log(last?.message, ' 444')
        // console.log(last, user, post, 'good tunes')

        //Your message so don't notify
        if (last?.userId?._id == user._id && post.messageIds.length != 0) {
          return
        }

        // console.log(pathname, last?.postId, 'pathname', pathname.split('/')[2], pathname.split('/')[2] === last?.postId, window.location)

        //You're in that chat room so don't notify



        if (window.location.hash.split('/').pop() === last?.postId && yourBrowserWindow.isFocused()) {
          console.log('YOURE IN THE CHAT ROOM')
          return
        }
        // console.log(post.event, 'event')
        if (post.event === "muc-occupant-joined" || post.event === "muc-occupant-left" || post.event === "muc-room-destroyed") {
          return
        }

        //New Room - Message everyone except you
        if (post.messageIds.length === 0) {
          console.log('newRoom', last?.userId?.name, last?.message, last?.userId?.avatar)
        // setTimeout(() => {
          return notify(`🏡 ${post?.user?.name}`, post?.message, post?.user?.avatar, `/chat/${post._id}`) ///() => history.push(`/chat/${post._id}`)
        // }, 2500)
        }




        //Message all members of a group DM unless the message came from yourself.
        if (post && post?.members) {

          for (let member of post?.members) {
            // console.log(member, user._id, member != user._id, 'fire')
            if (last?.message && member == user._id) {
              let icon = post.userChannel ? `🧐` : post.dmChannel ? `💬` : `🏡`
              return notify(`${icon} ${last?.userId?.name}`, last?.message, last?.userId?.avatar, `/chat/${post._id}`)
            }
          }
        }


      },



      event: ({ event }) => {
        //console.log('event', event)
        let inTheRoom = event.participants.some((x) => x.email == user.email)//You are in this room
        if (inTheRoom) {

          if (event.type === 'muc-occupant-joined' || event.type === 'muc-occupant-created') {
            if (event.post.user._id != user._id && event.post.hostPresent) { //You are not the host and the host is there.
              //if (event.post.hostPresent) { //You are not the host and the host is there.
              // console.log(event, ' crystal')
              setClock(true)
            }
          }
        } else {
          //console.log("You aint in that room")
        }
        if (event.type === 'muc-occupant-left' || event.type === 'muc-occupant-destroyed') {

          if (event.user.email == user.email || (!event.post.hostPresent && inTheRoom)) { //I left or the host is not there and I'm in this room.
            setClock(false)
          }
        }

      },

      encounter: (data) => {
      },

      liveUsers: (data) => {
        // console.log(data, 'liveUser')
        // let users = [...]
        setLiveUsers(data)
      },
      me: (data) => {
        //console.log(data, ',meee')
        //console.log(liveUsers)
        //liveUsers[data._id] = data
        //console.log(liveUsers)
      },
      totalConnections: ({ total }) => {
        //console.log('total,', total)
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

      sendToRoom(room) {
        // console.log('sendToRoom', room)
        gotoRoom(room)
      },

      typing({ who, where, what }) {
        console.log('tpying', who, where, what)
        // console.log(posts, myPosts, _posts, Object.keys(_posts).length)
        if (_posts[where].typing) {
          return
        }
        _setPosts(function (posts) {
          let newPosts = { ...posts }


          // let newPosts = { ..._posts }
          newPosts[where].typing = true
          newPosts[where].whoTyping = who
          if (newPosts[where].typeTimeout) {
            clearTimeout(newPosts[where].typeTimout)
          }
          newPosts[where].typeTimout = setTimeout(function () {

            _setPosts(function (posts) {
              let newPosts = { ...posts }
              console.log('end', _setPosts, newPosts[where])
              newPosts[where].typing = false
              newPosts[where].whoTyping = null

              return (newPosts)
            })
          }, 2000)

          return (newPosts)

        })

      },

      startTyping({ who, where, what }) {

        console.log('start', who, where, what)
        _setPosts(function (posts) {
          let newPosts = { ...posts }
          newPosts[where].typing = true
          newPosts[where].whoTyping = who
          return (newPosts)
        })
      },


      stopTyping({ who, where, what }) {
        console.log('stop', who, where, what)
        _setPosts(function (posts) {
          let newPosts = { ...posts }
          newPosts[where].typing = false
          newPosts[where].whoTyping = null
          return (newPosts)
        })
      }

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
    //console.log('user is', user?.data.name)
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
      getUser()
    }

    actions
      .getAllPosts()
      .then((res) => {
        if (res) {

          //console.log('all posts', res.data)
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

  // const activeRooms = Object.values(posts).filter(
  //   (x) =>
  //     (x && x?.message.toLowerCase().includes(query.toLowerCase()) && x?.active && x?.activeUsers.length) ||
  //     x?.id == 'lobby' ||
  //     x?.isLobby
  //   // (x) => (x.active && x.activeUsers.length) || x.id == 'lobby' || x.isLobby
  // )

  function notify(title, message, icon, redirect) {

    console.log("notify puppy dreams", redirect);

    // window.jitsiNodeAPI.ipc.send('notification-clicked', { redirect })

    // window.open("google.com", "_blank");
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
        icon: icon?.replace('svg', 'png'),//`https://avatars.dicebear.com/4.5/api/avataaars/0.33511928838302496.png`
        silent: true
      }
      let audio = new Audio('../resources/cowbell.wav')
      audio.volume = 0.5;
      setTimeout(() => audio.play(), 1000)


      var notification = new Notification(title, options);



      console.log(remote, win)
      console.log(win.isVisible(), ' visible?>')
      // console.log(win.hide)
      // console.log(win.isMinimized)
      // console.log(win.isHidden)


      notification.onclick = () => {
        // win.show()
        // win.maximize()
        if (!win.isVisible()) {
          win.restore()
          // win.show()
        }
        history.push(redirect)
        // window.jitsiNodeAPI.ipc.send('notification-clicked', { redirect })
      }




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



  const [littleVideo, setLittleVideo] = useState(false)

  const video = <VideoPreview setLittleVideo={setLittleVideo} />


  let [bounty, setBounty] = useState(10)
  const [style, setStyle] = useState({ width: `${window.innerWidth / 4}px` })
  const [liveUsers, setLiveUsers] = useState([])
  const [showSlider, setShowSlider] = useState(false)

  // console.log(posts, ' cool banana')

  // const [className, setStyle] = useState({ width: `${window.innerWidth / 4}px` })
  let [open, setOpen] = useState('rooms')

  // console.log(lobby_id, 'lobby_id')



  const context = {
    history,
    user,
    setUser,
    posts,
    setPosts,
    jwt,
    // activeRooms,
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

  // let drag = process.platform === "darwin" ? { webkitAppRegion: 'drag' } : {}
  // console.log('dtag ,', drag)
  return user ? (
    <TheContext.Provider value={context}>
      <header id="titlebar">

        <div className="buttons">
          <div className="close">
            <a onClick={() => {
              console.log(process.platform)
              process.platform === "darwin" ? win.hide() : win.minimize()
            }} className="closebutton" href="#"><span><strong>x</strong></span></a>

          </div>
          <div className="minimize">
            <a onClick={() => {
              win.minimize()
            }} className="minimizebutton" href="#"><span><strong>&ndash;</strong></span></a>

          </div>
          <div className="zoom">
            <a onClick={() => {
              console.log(win.fullScreen)
              win.setFullScreen(!win.fullScreen)
            }} className="zoombutton" href="#"><span><strong>+</strong></span></a>

          </div>
        </div>


        {/*
        <button onClick={() => {
          console.log(win);
          // win.setPosition(0, 0, true)
          win.hide()
        }}>
          Hidee </button>


        <button onClick={() => {
          console.log(win);
          // win.setPosition(0, 0, true)
          win.minimize()
        }}>
          Minimize </button>


        <button onClick={() => {
          console.log(win);
          // win.setPosition(0, 0, true)
          win.setFullScreen(true);
        }}>
          Max </button>

        <button onClick={() => {
          console.log(win);
          // win.setPosition(0, 0, true)
          win.setFullScreen(false);
        }}>
          Back </button> */}
      </header>
      <SideBar isInRoomRoute={isInRoomRoute} littleVideo={littleVideo} video={!isInRoomRoute && video} />
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
              <Route exact path="/" component={Profile} />
              {/* <Route exact path="/" render={(props) => history.push(`/chat/${lobby_id}`)} /> */}

              <Route exact path="/dashboard" component={Dashboard} />

              {/* <Route exact path="/create-room" component={CreateRoom} /> */}

              <Route exact path="/call-ended" component={CallEnded} />

              <Route path="/post/:id" render={(props) => <Post {...props} user={user} setUser={setUser} />} />

              <Route path="/profile" component={Profile} />

              <Route path="/chat/:id" component={Chat} />

              <Route path="/user/:id" component={User} />

              <Route path="/new-message" component={NewMessage} />

              <Route path="/new-question" component={NewQuestion} />

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
    <div class="please-log-in">
      <p>
        Please sign in through google using the popup window. <a onClick={reauth}>Click here</a> if
        the window did not open.{' '}
      </p>
    </div>
  ) : (
    <p>
      <GoogleAuth setJwt={setJwt} />{' '}
    </p>
  )
}

console.log('pigeon lives')




export default function CowBellWithRouter(props) {
  return (
    <HashRouter>
      <CowBell {...props} />
    </HashRouter>
  )
}




