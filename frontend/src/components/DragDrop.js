// import React, { useCallback } from 'react'
// import { useDropzone } from 'react-dropzone'

// export default function DragDrop() {
//     const onDrop = useCallback(acceptedFiles => {
//         // Do something with the files
//         console.log(acceptedFiles, 'dropped')
//     }, [])
//     const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

//     return (
//         <div {...getRootProps()}>
//             <input {...getInputProps()} />
//             {
//                 isDragActive ?
//                     <p>Drop the files here ...</p> :
//                     <p>Drag 'n' drop some files here, or click to select files</p>
//             }
//         </div>
//     )
// }

import React, { useMemo, useState, useEffect } from 'react';
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import actions from '../api'

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
    boxSizing: 'border-box'
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
};

const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
};




// interface IImageUpload {
// files: File[],
// onDrop: (acceptedFiles: File[]) => void
// }

const ImageUpload = ({ files, onDrop, typeMessage, message, channel, setMessage, setFiles }) => {
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


    const upload = () => {
        const uploadURL = 'https://api.cloudinary.com/v1_1/dcoxlanri/raw/upload';
        const uploadPreset = 'rgw5s8ai';
        const promises = [];

        files.forEach(file => {
            const formData = new FormData();
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
        setLoading(true)
        e.preventDefault()
        console.log(channel, message, files)
        let promises = []
        if (files.length > 0) {
            promises = upload()
        }

        Promise.all(promises).then(res => {
            console.log(res, 'finsihed', message)
            const images = res.map(image => image.data.secure_url)
            console.log(images)
            actions
                .addMessage({ channel, message, images })
                .then(res => {
                    setMessage('')
                    setFiles([])
                    setLoading(false)
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

    const thumbs = files.map(file => (
        <div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <img
                    alt={file.name}
                    src={file.preview}
                    style={img}
                />
            </div>
        </div>
    ));

    useEffect(() => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

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
                    <input type="text" value={message} placeholder="Say something... Earn a CowBell" onChange={typeMessage} />
                    <input {...getInputProps()} />
                    {/* <p>Drag 'n' drop some files here, or click to select files</p> */}
                    <div><button id="addMessage" disabled={false}><Icon name="add" /> <label></label></button>
                        <Icon name="image" {...getRootProps()} />
                    </div>
                </form>





            </div>

        </div>
    );
}

// export default ImageUpload;


const App = ({ typeMessage, message, channel, setMessage }) => {
    const [files, setFiles] = useState([]);

    const onDrop = (acceptedFiles) => {
        setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
    }



    return (
        <div className="App">
            <ImageUpload setFiles={setFiles} files={files} onDrop={onDrop} typeMessage={typeMessage} message={message} channel={channel} setMessage={setMessage} />
            {/* <button onClick={() => upload()}>Upload</button> */}

        </div>
    );
}

export default App;
