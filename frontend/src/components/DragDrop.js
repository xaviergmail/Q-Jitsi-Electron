

import React, { useMemo, useState, useEffect, createRef } from 'react';
import { Divider, Header, Icon, Image, List, Sidebar } from 'semantic-ui-react'
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import actions from '../api'
import ScreenRecorder from './ScreenRecorder'

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: '#000',
    borderStyle: 'dashed',
    // backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
};

const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box',
    // backgroundImage: `url(https://blog.majestic.com/wp-content/uploads/2010/10/Video-Icon-crop.png)`,
    // backgroundSize: 'cover',
    // backgroundPosition: 'center',
    // textIndent: `-10000px`
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden',
    objectFit: 'contain',
    justifyContent: 'center'
};

const img = {
    display: 'block',
    width: 'auto',
    height: '100%',
    objectFit: 'contain'
};



let typingTimeout = null
let typingNow = false


const ImageUpload = ({ files, onDrop, channel, socket, setFiles, user }) => {
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        // accept: 'image/*',
        onDrop: onDrop
    });

    let [loading, setLoading] = useState(false)
    let [message, setMessage] = useState('')
    let [codeBlock, setCodeBlock] = useState(false)
    let [shiftDown, setShiftDown] = useState(false)

    const typeMessage = e => {
        let msg = e.target.value
        setMessage(msg)

        if (!typingNow) {
            socket.emit('startTyping', {
                where: channel._id,//props.match.params.id, 
                who: user, what: msg
            })
            typingNow = true
        }

        clearTimeout(typingTimeout)
        typingTimeout = setTimeout(() => {
            socket.emit('stopTyping', {
                where: channel._id,//props.match.params.id, 
                who: user, what: msg
            })
            typingNow = false
        }, 2000)


        console.log(typingNow, 'typingNow')

    }





    const upload = () => {
        const uploadURL = 'https://api.cloudinary.com/v1_1/dcoxlanri/raw/upload';
        const uploadPreset = 'rgw5s8ai';
        const promises = [];

        files.forEach(file => {
            const formData = new FormData();
            console.log(file.type, ' ya>')
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            promises.push(axios({
                url: uploadURL,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: formData
            })
                .then(res => (res))
                .catch(err => console.log(err))
            )
        })

        return promises
    }


    const submitMessage = e => {
        console.log(e)
        setLoading(true)
        e.preventDefault()
        // console.log(channel, message, files)
        let promises = []
        if (files.length > 0) {
            promises = upload()
        }

        Promise.all(promises).then(res => {
            console.log(res, 'finsihed', message)
            const newFiles = res.map(file => file.data.secure_url)
            console.log(codeBlock && 'code-block', ' code ???')

            actions
                .addMessage({ channel: { _id: channel?._id }, message, files: newFiles, format: codeBlock && 'code-block' })
                .then(res => {
                    setMessage('')
                    setFiles([])
                    setLoading(false)
                    setCodeBlock(false)
                })
                .catch(console.error)
        })

    }

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragAccept,
        isDragReject
    ]);

    const thumbs = files.map(file => {
        console.log('waht the file rocket main')
        console.log(file)
        console.log(file.type)
        if (file.type.includes('video')) {
            return (
                <div onClick={() => console.log('yo')} style={thumb} key={file.name}>
                    <div style={thumbInner}>
                        <img
                            alt={file.name}
                            src="https://blog.majestic.com/wp-content/uploads/2010/10/Video-Icon-crop.png"
                            style={img}

                        />
                    </div>
                </div>
            )
        }

        return (
            <div onClick={() => console.log('yo')} style={thumb} key={file.name}>
            <div style={thumbInner}>
                <img
                    alt={file.name}
                    src={file.preview}
                    style={img}
                    />
            </div>
        </div>
        )
    });

    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));

    }, [files]);

    const handleEnter = e => {
        if (e.key == "Enter" && !shiftDown) {

            submitMessage(e)
        }
    }

    return (
        <div className="">

            <div {...getRootProps({
                style,
                onClick: event => event.stopPropagation()
            })}>



                {loading ? <span className="dot-windmill"></span> : null}
                <form disabled={loading} className="addNewMessage" onSubmit={submitMessage}>
                    <aside>
                        {thumbs}
                    </aside>

                    <textarea className={codeBlock ? 'codeBlock' : ''} required type="text" value={message} placeholder={`${codeBlock ? 'Code' : 'Say'} something... Earn a CowBell`} onChange={typeMessage} onKeyPress={handleEnter} onKeyDown={(e) => e.key == "Shift" ? setShiftDown(true) : null} onKeyUp={(e) => e.key == "Shift" ? setShiftDown(false) : null} />

                    {/* <input className={codeBlock ? 'codeBlock' : ''} required type="text" value={message} placeholder="Say something... Earn a CowBell" onChange={typeMessage} /> */}

                    <input {...getInputProps()} />
                    {/* <p>Drag 'n' drop some files here, or click to select files</p> */}
                    <div id="addMessage">
                        <button disabled={false}><Icon name="add" /> <label></label></button>
                    </div>
                </form>




                <div id="chat-options">
                    <button onClick={() => setCodeBlock(!codeBlock)}>
                        <span className="tooltip">Code Block</span>
                        <Icon name="code" />
                    </button>
                    <button {...getRootProps()} >
                        {/* <b>Upload</b> */}
                        <span className="tooltip">Upload File</span>

                        <Icon name="file" />
                    </button>
                    <ScreenRecorder files={files} setFiles={setFiles} />
                </div>

            </div>

        </div>
    );
}

// export default ImageUpload;


const App = ({ channel, socket, user }) => {
    const [files, setFiles] = useState([]);

    const onDrop = (acceptedFiles) => {
        console.log(acceptedFiles, ' like a child')
        setFiles(acceptedFiles.map(file => {
            console.log(file, 'smile')

            return Object.assign(file, {
            preview: URL.createObjectURL(file)
            })
        }));
    }



    return (
        <div className="App">
            <ImageUpload setFiles={setFiles} files={files} onDrop={onDrop} channel={channel} socket={socket} user={user} />
            {/* <button onClick={() => upload()}>Upload</button> */}

        </div>
    );
}

export default App;







// const { desktopCapturer, remote } = require('electron')
// const { Menu } = remote;

// const ScreenRecorder2 = () => {

//     const [source, setSource] = useState({})
//     const [stream, setStream] = useState(null)
//     const ref = createRef()
//     // console.log(ref, ref.current)
//     //    ref.current.srcObject = stream


//     useEffect(() => {
//         console.log(stream, ref, 'thugs')
//         // ref.current.srcObject = stream
//         // ref.current.style.transform = transform
//         if (ref.current) {

//             ref.current.srcObject = stream
//             ref.current.play()
//         }
//     }, [stream])






//     async function getVideoSources() {
//         const inputSources = await desktopCapturer.getSources({
//             types: ['window', 'screen']
//         });

//         const videoOptionsMenu = Menu.buildFromTemplate(
//             inputSources.map(source => {
//                 return {
//                     label: source.name,
//                     click: () => selectSource(source)
//                 };
//             })
//         );


//         videoOptionsMenu.popup();
//     }




//     let mediaRecorder; // MediaRecorder instance to capture footage
//     const recordedChunks = [];


//     // Captures all recorded chunks
//     function handleDataAvailable(e) {
//         console.log('video data available');
//         recordedChunks.push(e.data);
//     }

//     // Saves the video file on stop
//     async function handleStop(e) {
//         const blob = new Blob(recordedChunks, {
//             type: 'video/webm; codecs=vp9'
//         });

//         const buffer = Buffer.from(await blob.arrayBuffer());

//         const { filePath } = await dialog.showSaveDialog({

//             buttonLabel: 'Save video',
//             defaultPath: `vid-${Date.now()}.webm`
//         });

//         console.log(filePath);
//     }

//     // Change the videoSource window to record
//     async function selectSource(source) {
//         setSource(source)

//         // videoSelectBtn.innerText = source.name;

//         const constraints = {
//             audio: false,
//             video: {
//                 mandatory: {
//                     chromeMediaSource: 'desktop',
//                     chromeMediaSourceId: source.id
//                 }
//             }
//         };

//         // Create a Stream
//         const stream = await navigator.mediaDevices
//             .getUserMedia(constraints);

//         if (!stream)
//             setStream(stream)




//         // Preview the source in a video element
//         // videoElement.srcObject = stream;
//         // videoElement.play();
//         // useEffect(() => {
//         //     ref.current.srcObject = stream
//         //     // ref.current.style.transform = transform
//         //     ref.current.play()
//         // }, [stream])


//         // Create the Media Recorder
//         const options = { mimeType: 'video/webm; codecs=vp9' };
//         mediaRecorder = new MediaRecorder(stream, options);

//         // Register Event Handlers
//         mediaRecorder.ondataavailable = handleDataAvailable;
//         mediaRecorder.onstop = handleStop;
//     }

//     return (
//         <div>
//             {source?.name}
//             <Icon name="video" onClick={getVideoSources} />
//             <video
//                 autoPlay=""
//                 id="video"
//                 ref={ref} />

//             <button onClick={mediaRecorder?.start}>Start</button>
//             <button onClick={mediaRecorder?.stop}>Stop</button>
//         </div>
//     )

// }


// // In the renderer process.


// // desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
// //     for (const source of sources) {
// //         if (source.name === 'Electron') {
// //             try {
// //                 const stream = await navigator.mediaDevices.getUserMedia({
// //                     audio: false,
// //                     video: {
// //                         mandatory: {
// //                             chromeMediaSource: 'desktop',
// //                             chromeMediaSourceId: source.id,
// //                             minWidth: 1280,
// //                             maxWidth: 1280,
// //                             minHeight: 720,
// //                             maxHeight: 720
// //                         }
// //                     }
// //                 })
// //                 handleStream(stream)
// //             } catch (e) {
// //                 handleError(e)
// //             }
// //             return
// //         }
// //     }
// // })

// // function handleStream(stream) {
// //     console.log('streaggggggg', stream)
// //     const video = document.querySelector('#wtfvideo')
// //     video.srcObject = stream
// //     video.onloadedmetadata = (e) => video.play()
// // }

// // function handleError(e) {
// //     console.log(e, ' what is happening??')
// // }