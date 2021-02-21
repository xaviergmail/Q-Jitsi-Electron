import axios from 'axios'
import baseURL from './config.js'
import { /*NotificationContainer, */ NotificationManager } from 'react-notifications'
// import * as notificationHandler from '../notificationHandler'

console.log(baseURL)

const token = window.localStorage.getItem('token')
let t = token ? token.substring(0, 15) : null

console.log('TOKEN', t, 'NODE_ENV', process.env.NODE_ENV)
console.log('token')

const subChannel = new BroadcastChannel('swNotificationSub')
subChannel.onmessage = async function (e) {
  if (e.data.subscription) {
    console.log('eeee', e)
    console.log('swNotificationSub', e.data.subscription)
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

const API = axios.create({
  withCredentials: true,
  baseURL: baseURL + '/api',
  headers: { Authorization: `Bearer ${token}` },
})

const actions = {
  getUser: async () => {
    const user = await API.get(`/user`, resetHead())
    // await notificationHandler.register()
    return user
  },
  logIn: async (tokenId) => {
    const options = resetHead()

    options.headers['X-Google-Token'] = tokenId
    let res = await API.post('/login', '', options)
    console.log('res', res)
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
    console.log(id)
    return await API.get(`/post?id=${id}`, resetHead())
  },
  resolvePost: async (data) => {
    return await API.post(`/resolve-post`, data, resetHead())
  },
  cashOut: async (data) => {
    return await API.post(`/cash-out`, data, resetHead())
  },
}

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error?.response?.data)
    if (error?.response?.data.name !== 'JsonWebTokenError')
      NotificationManager.error(String(error?.response?.data.message))
    else NotificationManager.error('Please signup or login')
  }
)

export default actions
