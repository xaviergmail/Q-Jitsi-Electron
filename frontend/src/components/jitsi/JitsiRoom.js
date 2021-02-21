import React, { useContext } from 'react'

import TheContext from '../../TheContext'
import { jitsiURL } from '../../api/config'
import ReactLoading from 'react-loading'

class JitsiRoomManager {
  constructor(jitsi) {
    this.jitsi = jitsi
  }
}

function JitsiRoomFrame({ roomName, user, jwt }) {
  const jitsiContainerId = 'jitsi-container-id'

  console.log('roomName', roomName)

  // const jitsiContainerId = ...
  const [jitsi, setJitsi] = React.useState()
  const [loading, setLoading] = React.useState(true)

  const loadJitsiScript = () => {
    let resolveLoadJitsiScriptPromise = null

    const loadJitsiScriptPromise = new Promise((resolve) => {
      resolveLoadJitsiScriptPromise = resolve
    })

    const script = document.createElement('script')
    script.src = 'https://' + jitsiURL + '/external_api.js'
    script.async = true
    script.onload = resolveLoadJitsiScriptPromise
    document.body.appendChild(script)

    return loadJitsiScriptPromise
  }

  React.useEffect(() => {
    if (!jitsi) {
      ;(async () => {
        if (!window.JitsiMeetExternalAPI) {
          await loadJitsiScript()
        }

        const _jitsi = new window.JitsiMeetExternalAPI(jitsiURL, {
          roomName,
          jwt,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: user.name,
            avatar: user.imageUrl,
            email: user.email,
          },
          onload: () => {
            console.log('WOOO WE LOADED!')
            setLoading(false)

            _jitsi.roomManager = new JitsiRoomManager(_jitsi)
          },
          parentNode: document.getElementById(jitsiContainerId),
        })

        window._jitsi = _jitsi
        setJitsi(_jitsi)
      })()
    }

    return () => jitsi?.dispose?.()
  }, [jitsi, roomName, user.name, user.email, user.imageUrl, jwt])

  return (
    <>
      {loading && (
        <ReactLoading type="spin" color="rgb(0, 117, 255)" height="128px" width="128px" />
      )}
      <div
        id={jitsiContainerId}
        style={{ height: '100vh', width: '100%', display: loading ? 'none' : 'block' }}
      ></div>
    </>
  )
}

function JitsiRoom(props) {
  console.log(props)
  const { user, jwt, history } = useContext(TheContext)

  if (!user) {
    history.push('/')
  }

  return user && <JitsiRoomFrame {...{ roomName: props.match.params.roomName, user, jwt }} />
}

export default JitsiRoom
