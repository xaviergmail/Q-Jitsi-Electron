let baseURL
export let jitsiURL
console.log(process.env, ' gargantuan')

console.log('NODE_ENV', process.env.NODE_ENV)
if (process.env.NODE_ENV === 'production') {
  if (process.env.ELECTRON_WEBPACK_APP_API_URL) {
    baseURL = process.env.ELECTRON_WEBPACK_APP_API_URL
  } else {
    // throw new Error('ELECTRON_WEBPACK_APP_API_URL NOT SET IN PRODUCTION BUILD!')
  }

  if (process.env.ELECTRON_WEBPACK_APP_JITSI_URL) {
    jitsiURL = process.env.ELECTRON_WEBPACK_APP_JITSI_URL
  } else {
    // throw new Error('ELECTRON_WEBPACK_APP_JITSI_URL NOT SET IN PRODUCTION BUILD!')
  }
} else {
  baseURL = process.env.DEV_ELECTRON_WEBPACK_APP_API_URL || `http://localhost:5000`
  jitsiURL = process.env.DEV_ELECTRON_WEBPACK_APP_API_URL || `jitsi.local.cowbell.club:8443`
}

// baseURL = `https://cowbell.club`

// jitsiURL = `https://jitsi.cowbell.club`


console.log(baseURL, jitsiURL, 'urls')


export default baseURL
