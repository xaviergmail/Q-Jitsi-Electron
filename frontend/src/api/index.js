import axios from 'axios'
import baseURL from './config.js'



// import * as notificationHandler from '../notificationHandler'

console.log(baseURL)

const token = window.localStorage.getItem('token')
let t = token ? token.substring(0, 15) : null

// console.log('TOKEN', t, 'NODE_ENV', process.env.NODE_ENV)
// console.log('token')

const subChannel = new BroadcastChannel('swNotificationSub')
subChannel.onmessage = async function (e) {
  if (e.data.subscription) {
    // console.log('eeee', e)
    // console.log('swNotificationSub', e.data.subscription)
    await actions.subscribe(JSON.parse(e.data.subscription))
  }
}

let resetHead = () => {
  return {
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`,
    },
  }
}


axios.defaults.adapter = require('axios/lib/adapters/xhr');


const API = axios.create({
  withCredentials: true,
  baseURL: baseURL + '/api',
  headers: { Authorization: `Bearer ${token}` },
  timeout: 5000,
})

const actions = {
  getUser: async () => {
    let user
    try {
      user = await API.get(`/user`, resetHead())
    } catch (err) {
      console.error("Failed to get user data please log in again", err)
      localStorage.removeItem("token")
      window.location.reload()
    }
    // await notificationHandler.register()
    return user
  },
  logIn: async (tokenId) => {
    const options = resetHead()

    options.headers['X-Google-Token'] = tokenId
    let res = await API.post('/login', '', options)
    window.localStorage.setItem('googletoken', tokenId)
    if (res?.data?.token) window.localStorage.setItem('token', res?.data?.token)
    return res
  },
  logOut: async () => {
    window.localStorage.removeItem('token')
    return await API.get('/logout', resetHead())
  },
  addPost: async (message) => {
    return await API.post('/new-post', message, resetHead())
  },
  getMyPosts: async () => {
    return await API.get('/my-posts', resetHead())
  },
  getMyTransactions: async () => {
    return await API.get('/my-transactions', resetHead())
  },
  subscribe: async (data) => {
    return await API.post('/subscribe', data, resetHead())
  },
  getAllPosts: async () => {
    return await API.get('/all-posts', resetHead())
  },
  getPost: async (id) => {
    //How do i not need this?
    let res = await API.get(`/post?id=${id}`, resetHead())
    return res
  },
  resolvePost: async (data) => {
    return await API.post(`/resolve-post`, data, resetHead())
  },
  cashOut: async (data) => {
    return await API.post(`/cash-out`, data, resetHead())
  },
  addMessage: async (data) => {
    return await API.post(`/add-message`, data, resetHead())
  },
  getAllUsers: async () => {
    return await API.get(`/all-users`, resetHead())
  },
  getUserProfile: async (id) => {
    return await API.get(`/user-profile?id=${id}`, resetHead())
  },
  deleteRoom: async (id) => {
    return await API.delete(`/delete-room?id=${id}`, resetHead())
  },
  saveAvatar: async (avatar) => {
    return await API.post(`/save-avatar`, { avatar }, resetHead())
  },

  saveReaction: async (emojis, messageId) => {
    return await API.post(`/save-reaction?messageId=${messageId}`, emojis, resetHead())
  },
  findPreviousChat: async (users) => {
    return await API.post(`/find-previous-chat`, users, resetHead())
  }

}

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error(error?.response?.data)
//     NotificationManager.error(String(error?.response?.data?.message || error?.response?.data?.msg))
//     if (error?.response?.status == 403 || error?.response?.status == 401) {
//       localStorage.removeItem("token")
//       localStorage.removeItem("googletoken")
//     }

//   }
// )

export default actions
