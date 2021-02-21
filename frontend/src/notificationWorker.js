// Shamelessly copied from https://medium.com/zettle-engineering/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679

self.addEventListener('install', async (e) => {
  self.skipWaiting()
})

// CHANGE WEB THING TO PUSH JSON AND STRINGIFY HERE TO SET
// NOTIFICATION TITLE, BODY AND CLICK URL
self.addEventListener('push', function (event) {
  const options = { body: event.data.text(), title: 'Pls Help!' }

  try {
    const data = JSON.parse(options.body)
    options.body = data.body
    options.title = data.title
    options.tag = data.url
    console.log('what', data)
  } catch (e) {
    /*not json whatever*/
  }

  console.log('iot:', options)

  if (event.data) {
    event.waitUntil(self.registration.showNotification(options.title, options))
  } else {
    console.log('Push event but no data')
  }
})

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.')

  console.log('event is', event)
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.tag || 'https://plshelp.live/'))
})
