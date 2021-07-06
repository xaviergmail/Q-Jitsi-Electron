import React, { useEffect, useContext } from 'react';
import TheContext from '../TheContext'
import actions from '../api'

function Wut(props) {
    // console.log(props, window, window.jitsiMeetExternalAPI, '!WUT')
    // const { socket } = useContext(TheContext)



    // useEffect(() => {

    //     const api = window.jitsiMeetExternalAPI
    //     // console.log(api?._getLargeVideo(), ' get the frigginn lagrge vid', socket)
    //     let feed = api?._getLargeVideo()

    //     // console.log(feed, ' feed me', api?.captureLargeVideoScreenshot())

    //     if (!api) return

    //     setTimeout(() => {
    //         api.captureLargeVideoScreenshot().then(data => {
    //             // data is an Object with only one param, dataURL
    //             // data.dataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAA..."
    //             console.log(data.dataURL)
    //             var bindata = new Buffer(data.dataURL.split(",")[1], "base64");

    //             actions.shareScreenShot({ shot: bindata })
    //         })

    //     }, 10000)

    //     //socket.emit('video', { feed })
    //     // if (vid) {
    //     //     socket.emit('video', vid)
    //     // }
    // }, [window.jitsiMeetExternalAPI])

    // useEffect(() => {
    //   console.log(window, window.jitsiMeetExternalAPI, 'WUT')
    // }, [])
    return <div>HMMMMM</div>
}

export default Wut