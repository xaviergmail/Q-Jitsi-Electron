let baseURL
export let jitsiURL
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
  baseURL = process.env.ELECTRON_WEBPACK_APP_API_URL || `http://localhost:5000`
  jitsiURL = process.env.ELECTRON_WEBPACK_APP_JITSI_URL || `jitsi.local.plshelp.live:8443`
}

export default baseURL
