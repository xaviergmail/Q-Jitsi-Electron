import React, { Fragment, useState, useEffect } from 'react'
import { Switch, Route, NavLink, useHistory, Link, HashRouter } from 'react-router-dom'
import TheContext from './TheContext'
import Home from './components/home/Home'
import { NavBar } from './components/home/NavBar'
import NotFound from './components/404/NotFound.js'
import Profile from './components/profile/Profile'
import Post from './components/post/Post'
import Dashboard from './components/dashboard/Dashboard'
import ReactLoading from 'react-loading'
import Room from './components/Room'


import 'react-notifications/lib/notifications.css'
import 'semantic-ui-css/semantic.min.css'
import './index.css'


import actions from './api/index'
import { NotificationContainer /*NotificationManager */ } from 'react-notifications'
import io from 'socket.io-client'


//Make connection to server just once on page load.
import baseURL from './api/config'
import JitsiRoom from './components/jitsi/JitsiRoom'
const socket = io(baseURL)


//require('devtron').install()
//require('react-devtools-electron').install()



const CowBell = ({children}) => {

  let [user, setUser] = useState(null)
  let [posts, setPosts] = useState({})
  const [visible, setVisible] = useState(true)



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

  useEffect(() => {
    window.jitsiNodeAPI.ipc.on('gauth-tk', updateToken) // send notification to main process

    if (!jwt) {
      const googleToken = localStorage.getItem("googletoken")
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


    socket.on('post', (post) => {
      setPosts(function (posts) {
        let newPosts = { ...posts }
        newPosts[post._id] = post
        return newPosts
      })
    })

    if (jwt && !user) {
      getUser().then(() => {})
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

    return () => {
      socket.off('post')
    }
  }, [jwt, user])

  const logOut = async () => {
    await actions.logOut()
    setUser(null)
  }

  const history = useHistory()

  return (
      <TheContext.Provider value={{ history, user, setUser, posts, jwt }}>
        <NavBar visible={visible} setVisible={setVisible} history={history} > 
          <main>
            {loadingUser ? (
              <ReactLoading type="bars" color="rgb(0, 117, 255)" height="128px" width="128px" />
            ) : (
              <>
                {user && (
                  <Switch>
                    <Route
                      exact
                      path="/"
                      component={Home}
                    />
                    <Route
                      exact
                      path="/dashboard"
                      component={Dashboard}
                    />

                    <Route
                      exact
                      path="/profile"
                      component={Profile}
                    />

                    <Route
                      path="/post/:id"
                      render={(props) => <Post {...props} user={user} />}
                    />

                    {/* {children} */}
                    <Route path="/room/:roomName" render={(props) => <Room roomId={props.match.params.id} jitsiApp={children} {...props} />} />

                    {/* <Route path="/room/:roomName" render={(props) => <JitsiRoom {...props} />} /> */}

                    <Route
                      component={NotFound}
                    />


                  </Switch>
                )}
                {!user && <p>Please sign in through google using the popup window. <a onClick={reauth}>Click here</a> if the window did not open.</p>}
              </>
            )}
          </main>
          <NotificationContainer />
        </NavBar>
      </TheContext.Provider>
  )
}
export default function CowBellWithRouter (props){ 
  console.log(props)
  return <HashRouter><CowBell {...props} /></HashRouter> 
}

// export default (props) => <HashRouter><CowBell {...props} /></HashRouter> 





//  function gotoRoom(dispatch, roomID) {
  
//   const conference = createConferenceObjectFromURL(process.env.ELECTRON_WEBPACK_APP_JITSI_URL + "/" + roomID);
//   conference.jwt = localStorage.token
//   console.log("dispatch", dispatch)
//   console.log("push", push)
//   console.log("conference", conference)
//   window._conference = conference
//   window._push = push
//   window._dispatch = dispatch

//   dispatch(push('/conference', conference))
// }
