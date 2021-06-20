import React, { useState, useContext, createRef, useEffect } from 'react'
import TheContext from '../../TheContext'

import './controls.css'

// import AlwaysOnTop from './Controls/AlwaysOnTop'

export default function VideoPreview({ setLittleVideo }) {
  const [stream, setStream] = useState()
  const [transform, setTransform] = useState()
  const [hasVideo, setHasVideo] = useState(false)

  const { room, gotoRoom } = useContext(TheContext)

  const ref = createRef()

  useEffect(() => {
    const api = window.jitsiMeetExternalAPI

    if (api) {
      const listeners = {
        speakerChanged: (evt) => {
          const largeVideo = api._getLargeVideo()
          console.log(largeVideo, 'largeVideo')
          setHasVideo(largeVideo)
          setStream(largeVideo?.srcObject)
          setTransform(largeVideo?.style?.transform)
          if (largeVideo) {
            setLittleVideo(true)
          } else {
            setLittleVideo(false)
          }

        },
      }

      listeners.speakerChanged()

      for (const [k, v] of Object.entries(listeners)) {
        api.on(k, v)
      }

      return () => {
        if (api && typeof api.removeListeners == 'function') {
          for (const [k, v] of Object.entries(listeners)) {
            api.removeListeners(k, v)
          }
        }
      }
    }
  }, [window.jitsiMeetExternalAPI])

  useEffect(() => {
    ref.current.srcObject = stream
    ref.current.style.transform = transform
    ref.current.play()
    // console.log(ref, ' when does this happen?')
    // if (ref.current) {
    //   console.log(ref.current, ' does this go!', ref.current.paused, ref.current.play)
    //   setLittleVideo(true)
    // }

  }, [stream, transform])

  // console.log('stream', stream)

  return (
    <div className="videobottomright">
      {/* <AlwaysOnTop /> */}
      <video
        autoPlay=""
        id="video"
        ref={ref}
        style={{ transform: 'none', display: hasVideo ? 'block' : 'none', cursor: 'pointer' }}
        muted
        onClick={() => { setLittleVideo(false); gotoRoom(room); }}
      ></video>
    </div>
  )
}
