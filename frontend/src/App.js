import React, { Fragment, useState, useEffect } from 'react'
import { Switch, Route, NavLink, useHistory, Link } from 'react-router-dom'
import TheContext from './TheContext'
import Home from './components/home/Home'
import { NavBar } from './components/home/NavBar'
import NotFound from './components/404/NotFound.js'
import Profile from './components/profile/Profile'
import Post from './components/post/Post'
import Dashboard from './components/dashboard/Dashboard'
import ReactLoading from 'react-loading'

import actions from './api/index'
import GoogleAuth from './components/auth/GoogleAuth'
import { NotificationContainer /*NotificationManager */ } from 'react-notifications'
import io from 'socket.io-client'
import { BrowserRouter } from 'react-router-dom';


// const { token } = sessionStorage;

//Make connection to server just once on page load.
import baseURL from './api/config'
import JitsiRoom from './components/jitsi/JitsiRoom'
console.log('baseURL', baseURL)
const socket = io(baseURL)
/*
const publicIp = require('public-ip')
const iplocation = require('iplocation')

(async () => {
  let res = await iplocation(await publicIp.v4())
  console.log(res)
})()
*/

function Pad(render) {
  return (...args) => {
    return <div className="navbar-pad">{render(...args)}</div>
  }
}

const App = () => {
  let [user, setUser] = useState(null)
  let [posts, setPosts] = useState({})

  const [jwt, setJwt] = useState(localStorage.getItem('token'))
  let [loadingUser, setLoadingUser] = useState(jwt != null)

  useEffect(() => {
    console.log('use effect')

    socket.on('post', (post) => {
      // setPosts(function (posts) {
      //   let newPosts = { ...posts }
      //   newPosts[post._id] = post
      //   return newPosts
      // })
    })

    async function getUser() {
      let user = await actions.getUser()
      console.log('user is', user)
      if (user) {
        setUser(user?.data)
      }
      setLoadingUser(false)
    }

    if (jwt && !user) {
      getUser().then(() => {})
    }

    actions
      .getAllPosts()
      .then((res) => {
        console.log('WE GOT ALL POSTSTFOM API', res.data)
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
  console.log(user, '?')

  return (
    <BrowserRouter>
    <TheContext.Provider value={{ history, user, setUser, posts, jwt }}>
        <NavBar />

        <main>
          {console.log('user, loadinguser, jwt', user, loadingUser, jwt)}
          {loadingUser ? (
            <ReactLoading type="bars" color="rgb(0, 117, 255)" height="128px" width="128px" />
          ) : (
            <>
              {user && (
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={Pad((props) => (
                      <Home {...props} className="navbar-pad" />
                    ))}
                  />
                  <Route
                    exact
                    path="/dashboard"
                    render={Pad(() => (
                      <Dashboard />
                    ))}
                  />

                  <Route
                    exact
                    path="/profile"
                    render={Pad((props) => (
                      <Profile {...props} />
                    ))}
                  />

                  <Route
                    path="/post/:id"
                    render={Pad((props) => (
                      <Post {...props} user={user} />
                    ))}
                  />

                  <Route path="/room/:roomName" render={(props) => <JitsiRoom {...props} />} />

                  <Route
                    render={Pad(() => (
                      <NotFound />
                    ))}
                  />
                </Switch>
              )}
              {!user && <GoogleAuth setJwt={setJwt} />}
            </>
          )}
        </main>
        <NotificationContainer />
    </TheContext.Provider>
</BrowserRouter>
  )
}
export default App
