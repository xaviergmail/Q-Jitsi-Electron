import React, { useEffect, useContext, useState } from 'react';
import TheContext from '../TheContext'
import actions from '../api/index'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'
import EmojiPicker from './EmojiPicker'
import moment from 'moment'
import User from './User'
import { Picker, emojiIndex, store, Emoji } from 'emoji-mart'




function Chat(props) {



    const { activeRooms, gotoRoom, posts, setPosts, history, user, socket } = useContext(TheContext)
    const [channels, setChannels] = useState([])
    const [channel, setChannel] = useState({})
    const [messages, setMessages] = useState([])

    let [message, setMessage] = useState('')
    let [typing, setTyping] = useState(false)
    let typeTimeout = null;



    useEffect(() => {

        fetchChannel(props.match.params.id)

    }, [props.match.params.id])


    const typeMessage = e => {

        setMessage(e.target.value)


        socket.emit('typing', { where: props.match.params.id, who: user, what: e.target.value })

        // setTyping(true)
        // if (typeTimeout)
        //     clearTimeout(typeTimout)
        // typeTimeout = setTimeout(() => {
        //     setTyping(false)
        // }, 2000)
    }
    // console.log(typing)
    //DO I Need this?? 
    const fetchChannel = async (id) => {

        let res = await actions.getPost(id)
        // console.log(res, 'gold lion')
        if (res) {
            setChannel(res.data.post)
            setMessages(res.data.messages.reverse())
            let updatedPosts = { ...posts }
            // console.log(updatedPosts, 'updated', id)
            // updatedPosts[id] = res.data.post
            // _setPosts(updatedPosts)
        }
    }





    const showMessages = () => {

        let thisPost = posts[props.match.params.id];
        if (thisPost) {
            return [...thisPost.messageIds].reverse().map((message) => {
                return < ShowMessage {...message} />
            })
        }
    }

    let mostUsedEmojis = localStorage['emoji-mart.frequently']
    if (mostUsedEmojis) {
        mostUsedEmojis = JSON.parse(mostUsedEmojis)
    }
    // console.log('mostUsedEmojis,', mostUsedEmojis)

    const ShowMessage = ({ message, userId, createdAt, _id, reactions }) => {
        const [chosenEmoji, setChosenEmoji] = useState(null);
        const [emojis, setEmojis] = useState(reactions || [])
        const [showReactions, setShowReactions] = useState(false)

        const saveReaction = (emoji) => {
            let alreadyThere = false
            for (let emo of emojis) {
                if ((emo.emoji.unified == emoji.unified) && !alreadyThere) {
                    if (!emo.users.includes(user._id)) {
                        emo.users.push(user._id)
                    } else {
                        emo.users.splice(emo.users.indexOf(user._id), 1)
                    }
                    alreadyThere = true
                    break;
                }
            }
            if (!alreadyThere) {
                emojis.push({
                    emoji, users: [user._id]
                })
            }


            actions.saveReaction(emojis, _id).then(res => {
                console.log(res.data, 'back from db')
            })





        }
        return (
            <li key={createdAt} className="message" onMouseLeave={() => setShowReactions(false)}>
                <Image onClick={() => history.push(`/chat/${userId?.postId}`)} avatar src={userId?.avatar} style={{ background: 'white' }} />
                <div className="msg">
                    <b className="name">{userId?.name} <i>{moment(createdAt).fromNow()}</i></b>
                    <p className="text">{message}</p>
                    <div className="reactions">
                        <div className="emojis-picked">{emojis.map(reaction => reaction.users.length > 0 && <span onClick={() => saveReaction(reaction.emoji)}>{reaction.emoji.native} <sub>{reaction.users.length}</sub></span>)}</div>
                        {showReactions ?
                            <EmojiPicker setShowReactions={setShowReactions} saveReaction={saveReaction} />
                            : null}

                        <div className="emoji-options" >
                            <button className="reaction-btn" onClick={() => setShowReactions(!showReactions)}> <Icon name="plus circle" /></button>

                            <div className="pop-emojis">{mostUsedEmojis ? Object.keys(mostUsedEmojis).slice(0, 100).reverse().map(emoji => <Emoji onClick={saveReaction} emoji={emoji} size={16} />) : null}</div>
                        </div>


                    </div>

                </div>


            </li>
        )
    }


    const submitMessage = e => {
        e.preventDefault()
        actions
            .addMessage({ channel, message })
            .then(res => {
                setMessage('')
            })
            .catch(console.error)
    }


    const showActiveUsers = () => {
        for (let id in posts) {
            if (id == channel?._id && posts[id]?.activeUsers.length > 0) {

                return (


                    <div id="activeUsers">
                        <List inverted id="active-users-list">
                            {posts[id].activeUsers.map(member => (
                                <span className="particpant-container" key={member?._id}> <Image onClick={() => history.push(`/chat/${member?.postId}`)} avatar src={member?.avatar} style={{ background: 'white' }} />
                                    <span className='participant-name'>{member?.name}</span>
                                </span>

                            ))}
                        </List>
                    </div>

                )
            }
        }
        return (
            <></>
        )
    }

    const showMembers = () => {
        if (channel && channel?.members) {
            return <div className="chat-members">

                {channel?.members.map(member => <span key={member?._id}> <Image onClick={() => history.push(`/chat/${member?.postId}`)} avatar src={member?.avatar} style={{ background: 'white' }} /> <span className="namey">{member?.name}</span></span>)}

            </div>
        }
    }

    const closeRoom = async () => {
        if (confirm("Are you sure?  This cannot be undone.")) {
            let res = await actions.deleteRoom(channel._id)
            console.log(res.data)
            // let updatedPosts = {...posts}
            // delete updatedPosts[res.data.post._id]
            // setPosts(updatedPosts)
            //history.push('/profile')
        }
    }

    let iframe = `${process.env.ELECTRON_WEBPACK_APP_JITSI_URL}/${channel._id}?jwt=${localStorage.getItem('token')}#jitsi_meet_external_api_id=0&config.startWithAudioMuted=true&config.startWithVideoMuted=false&appData.localStorageContent=null`
    console.log(iframe, ' cconstructed', channel._id)
    //https://jitsi.local.cowbell.club:8443/60bbcb15cea80fdcf48dbae9?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InBvc3RzIjpbXSwicG9pbnRzIjo4MywiY29uZmlybWVkRW1haWwiOmZhbHNlLCJub3RpZmljYXRpb25DaGFubmVscyI6W10sImF2YXRhcnMiOlsiaHR0cHM6Ly9hdmF0YXJzLmRpY2ViZWFyLmNvbS80LjUvYXBpL2F2YXRhYWFycy8wLjIyMjgwMDUyOTQyNjg5OTMyLnN2ZyIsImh0dHBzOi8vYXZhdGFycy5kaWNlYmVhci5jb20vNC41L2FwaS9hdmF0YWFhcnMvMC40MzA5MjM1NTcwMTY1MDg0LnN2ZyIsImh0dHBzOi8vYXZhdGFycy5kaWNlYmVhci5jb20vNC41L2FwaS9hdmF0YWFhcnMvMC43MzQ2NzE4NjQ0MDExMjcyLnN2ZyIsImh0dHBzOi8vYXZhdGFycy5kaWNlYmVhci5jb20vNC41L2FwaS9hdmF0YWFhcnMvMC40MTQ5NjU5NjUzOTMwODMwNi5zdmciXSwiX2lkIjoiNjBhYmY4ZWQ1YmVmY2RmMzE3MmFjMmNkIiwiZW1haWwiOiJzcXVpcnJlbHE4ODg4QGdtYWlsLmNvbSIsIm5hbWUiOiJTcXVpcnJlbCBRIiwiYXZhdGFyIjoiaHR0cHM6Ly9hdmF0YXJzLmRpY2ViZWFyLmNvbS80LjUvYXBpL2F2YXRhYWFycy8wLjIyMjgwMDUyOTQyNjg5OTMyLnN2ZyIsInBvc3RJZCI6IjYwYWJmOGVkNWJlZmNkZjMxNzJhYzJjYyIsImNyZWF0ZWRBdCI6IjIwMjEtMDUtMjRUMTk6MDU6MTcuMjQ5WiIsInVwZGF0ZWRBdCI6IjIwMjEtMDYtMDVUMTk6MDU6NTcuOTc4WiJ9LCJjb250ZXh0Ijp7InVzZXIiOnsibmFtZSI6IlNxdWlycmVsIFEiLCJlbWFpbCI6InNxdWlycmVscTg4ODhAZ21haWwuY29tIiwiYXZhdGFyIjoiaHR0cHM6Ly9hdmF0YXJzLmRpY2ViZWFyLmNvbS80LjUvYXBpL2F2YXRhYWFycy8wLjIyMjgwMDUyOTQyNjg5OTMyLnN2ZyJ9fSwicm9vbSI6IioiLCJpYXQiOjE2MjU1MTUxNjEsImV4cCI6MTYyNjExOTk2MSwiYXVkIjoicGxzaGVscC1saXZlIiwiaXNzIjoicGxzaGVscC1saXZlIn0.cr1gNsNasDezBiuaeDiDMo8TfUs6hUPAF5ns5N4K8l0#jitsi_meet_external_api_id=0&config.startWithAudioMuted=true&config.startWithVideoMuted=false&appData.localStorageContent=null

    return (
        <section id="chat">

            <main>

                {/* <iframe src={iframe} /> */}



                <div id="messages">
                    <header className="message-title">
                        {channel?.isLobby ? null :
                            <h4 className="bounty"><span>💰</span><span>{channel?.bounty}</span></h4>
                        }
                        <h1>{channel?.message}</h1>
                        
                        <div className='video'>

                        <div className="controls">

                            {channel?.userChannel ?

                                <button onClick={() => history.push(`/new-message/?user=${channel?.user._id}`)}>
                                    <Icon name="chat" /> Chat
                                </button>

                                :

                                <button onClick={() => gotoRoom(channel._id, channel)}>
                                    <Icon name="video" /> Video
                                </button>

                                }
                            </div>
                            {showActiveUsers()}

                        </div>

                    </header>

                    {channel?.userChannel ?
                        <User userId={channel?.user} />
                        :
                        <>
                            <ul id="chat-messages">

                                {showMessages()}
                                <li className="message first">

                                    {/* <div>{showActiveUsers()}</div> */}


                                    <h2>#{channel?.message}!</h2>
                                    <i id="created-by">
                                        {/* <Image onClick={() => history.push(`/chat/${channel?.user?.postId}`)} avatar src={channel?.user?.avatar} style={{ background: 'white' }} /> */}
                                        Created by {channel?.user?.name}
                                    </i>
                                    {/* <span>{showMembers()}</span> */}




                                    <p>This is the beginning of your chat history...</p>
                                    <p>{channel?.user == user?._id && !channel?.userChannel ? <button onClick={closeRoom} className="remove">Close Room</button> : null}</p>
                                </li>
                            </ul>

                            {posts[props.match.params.id]?.typing ? posts[props.match.params.id]?.whoTyping.name : 'no one typing'}
                            <form className="addNewMessage" onSubmit={submitMessage}>
                                <input type="text" value={message} placeholder="Say something... Earn a CowBell" onChange={typeMessage} />
                                {/* <button>+</button> */}
                                <button id="addMessage" disabled={false}><Icon name="add" /> <label></label></button>
                            </form>
                        </>
                    }

                </div>

            </main>




        </section>
    );
}

export default Chat;