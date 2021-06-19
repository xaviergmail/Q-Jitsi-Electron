import React, { useEffect, useContext, useState } from 'react';
import TheContext from '../TheContext'
import actions from '../api/index'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'
import moment from 'moment'
import User from './User'


function Chat(props) {


    const { activeRooms, gotoRoom, posts, setPosts, history, user } = useContext(TheContext)
    const [channels, setChannels] = useState([])
    const [channel, setChannel] = useState({})
    const [messages, setMessages] = useState([])
    let [message, setMessage] = useState('')
    

    useEffect(() => {


        // const query = new URLSearchParams(props.location.search);
        // console.log(query.get('user'), 'peace of mind', props)


       // if (props.match.params.id != 'new') {
            fetchChannel(props.match.params.id)
        /* } else {
             console.log('set up new chat for direct messages', props)
             if (props.location.state)
                 setThisRoom(props.location.state.room)
         }*/


    }, [props.match.params.id])

    //DO I Need this?? 
    const fetchChannel = async (id) => {

        let res = await actions.getPost(id)
        console.log(res, 'gold lion')
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
        //console.log('show messages here ', thisPost)
        if (thisPost) {
            return [...thisPost.messageIds].reverse().map(({ message, userId, createdAt }) => (
                <li key={createdAt} className="message">
                    <Image onClick={() => history.push(`/user/${userId?._id}`)} avatar src={userId?.avatar} style={{ background: 'white' }} />
                    <div>
                        <b className="name">{userId?.name} <i>{moment(createdAt).fromNow()}</i></b>
                        <p className="text">{message}</p>
                    </div>
                </li>
            ))
        }
    }


    const submitMessage = e => {
        console.log(channel, message, ' om dos')
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
            if (id == channel._id && posts[id].activeUsers.length > 0) {

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

    return (
        <section id="chat">

            <main>
                {/* <div id="channels">
                    <label>Channels {channel.message}</label>
                    <ul>
                        {showChannels()}
                    </ul></div> */}

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
                        {/* <h1>{channel.message}</h1> */}
                            {showActiveUsers()}

                        </div>

                    </header>

                    {channel?.userChannel ? <User userId={channel?.user} /> :

                        <>
                            <ul>

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
                            <form className="addNewMessage" onSubmit={submitMessage}>
                                <input type="text" value={message} placeholder="Say something... Earn a CowBell" onChange={e => setMessage(e.target.value)} />
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