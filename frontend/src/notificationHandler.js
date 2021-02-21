import actions from './api'

const registerServiceWorker = async () => {
  const swRegistration = await navigator.serviceWorker.register('/notificationWorker.js') //notice the file name
  return swRegistration
}

var check = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No Service Worker support!')
  }

  if (!('PushManager' in window)) {
    throw new Error('No Push API Support!')
  }

  if (!window.Notification.permission) {
    alert(
      'We are about to ask for your permission to send notifications.\n' +
        'Please accept to be notified when fellow colleagues need help!'
    )
  }

  window.addEventListener('click', async function () {
    const permission = await window.Notification.requestPermission()
    // value of permission can be 'granted', 'default', 'denied'
    // granted: user has accepted the request
    // default: user has dismissed the notification permission popup by clicking on x
    // denied: user has denied the request.
    if (permission !== 'granted') {
      throw new Error('Permission not granted for Notification')
    }
  })
}

let vapid_publickey
if (process.env.ELECTRON_WEBPACK_APP_VAPID_PUBLICKEY) {
  vapid_publickey = process.env.ELECTRON_WEBPACK_APP_VAPID_PUBLICKEY
} else {
  throw new Error('ELECTRON_WEBPACK_APP_VAPID_PUBLICKEY NOT SET!')
}

const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function installPush(swRegistration) {
  try {
    const applicationServerKey = urlB64ToUint8Array(vapid_publickey)
    const options = { applicationServerKey, userVisibleOnly: true }
    const subscription = await swRegistration.pushManager.subscribe(options)
    console.log('Got subscription object', JSON.stringify(subscription))

    actions.subscribe({ subscription: JSON.stringify(subscription) })
  } catch (err) {
    console.log('Error', err)
  }
}

function idkatthispoint(reg) {
  //https://stackoverflow.com/questions/39624676/uncaught-in-promise-domexception-subscription-failed-no-active-service-work
  var serviceWorker
  if (reg.installing) {
    serviceWorker = reg.installing
    console.log('Service worker installing')
  } else if (reg.waiting) {
    serviceWorker = reg.waiting
    console.log('Service worker installed & waiting')
  } else if (reg.active) {
    serviceWorker = reg.active
    console.log('Service worker active')
  }

  if (serviceWorker) {
    console.log('sw current state', serviceWorker.state)
    if (serviceWorker.state == 'activated') {
      //If push subscription wasnt done yet have to do here
      console.log('sw already activated - Do watever needed here')
      installPush(reg).then()
    }
    serviceWorker.addEventListener('statechange', function (e) {
      console.log('sw statechange : ', e.target.state)
      if (e.target.state == 'activated') {
        // use pushManger for subscribing here.

        installPush(reg).then()
      }
    })
  }
}

export async function register() {
  console.log('registering sw')
  window.swRegistration = await registerServiceWorker()
  await check()
  await idkatthispoint(window.swRegistration)
  console.log('browser did its part', window.swRegitration)
}

window.showNotification = function (title, body) {
  const options = {
    body,
  }
  window.swRegistration.showNotification(title, options)
}
