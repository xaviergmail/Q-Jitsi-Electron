import React, { useState, useContext, createRef, useEffect } from 'react'
import TheContext from '../../TheContext'

import './controls.css'

// import AlwaysOnTop from './Controls/AlwaysOnTop'

export default function VideoPreview({ setLittleVideo }) {
  const [stream, setStream] = useState()
  const [transform, setTransform] = useState()
  const [hasVideo, setHasVideo] = useState(false)

  const { room, gotoRoom, user } = useContext(TheContext)

  const ref = createRef()

  useEffect(() => {
    console.log(window, ' window')
    const api = window.jitsiMeetExternalAPI

    if (api) {
      const listeners = {
        speakerChanged: (evt) => {
          console.log('evt', evt, api)
          let largeVideo = api._getLargeVideo()
          console.log(largeVideo, 'largeVideo')
          // const avatarURL = api.getAvatarURL()
          // const displayName = api.getDisplayName()
          // const formattedDisplayName = api._getFormattedDisplayName(user._id)

          //api.setLargeVideoParticipant(participantId);
          // api.dominantSpeakerChanged()

          console.log(api.getVideoQuality(), ' !!!okdokey in view preview')


          api.captureLargeVideoScreenshot().then(data => {
            // data is an Object with only one param, dataURL
            // data.dataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAA..."
            console.log(data, ' screen shot')
            //console.log(String(data.dataURL))
          });
          console.log("whats this")

          api.getLivestreamUrl().then(livestreamData => {
            // livestreamData = {
            //     livestreamUrl: 'livestreamUrl'
            // }
            console.log('never fires')
            console.log(liveStreamData, 'live stream')


          }).catch(err => console.error('err,err', err))

          console.log(largeVideo?.srcObject, 'largeVideo?.srcObject')
          setHasVideo(largeVideo)
          setStream(largeVideo?.srcObject)
          setTransform(largeVideo?.style?.transform)
          if (largeVideo) {
            setLittleVideo(true)
          } else {
            setLittleVideo(false)
          }
        },

        dominantSpeakerChanged: (evt) => {
          console.log('dominant speaker chnaged', evt)
          // api._setLargeVideoParticipant(evt.id);
        }
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

  console.log('stream', stream, hasVideo)

  return (
    <div className="videobottomright">
      {/* <AlwaysOnTop /> */}
      <video
        autoPlay=""
        id="video"
        ref={ref}
        // style={{ transform: 'none', cursor: 'pointer' }}

        style={{ transform: 'none', display: hasVideo ? 'block' : 'none', cursor: 'pointer' }}
        muted
        onClick={() => { setLittleVideo(false); gotoRoom(room); }}
      ></video>
    </div>
  )
}
