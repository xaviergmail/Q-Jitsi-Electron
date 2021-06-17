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
        // console.log("does this happen?", posts, channel)
        for (let id in posts) {
            if (id == channel._id) {
                console.log(posts[id], 'our dude')
                return posts[id].activeUsers.map(member => <span key={member._id}> <Image onClick={() => history.push(`/chat/${member?.postId}`)} avatar src={member?.avatar} style={{ background: 'white' }} /> <span>{member.name}</span></span>)
            }
        }
        return (
            <div>yeahs</div>
        )
    }

    const showMembers = () => {
        if (channel && channel?.members) {
            return channel?.members.map(member => <span key={member._id}> <Image onClick={() => history.push(`/chat/${member?.postId}`)} avatar src={member?.avatar} style={{ background: 'white' }} /> <span>{member.name}</span></span>)
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
                        

                        <div className="controls">
                            <button onClick={() => gotoRoom(channel._id, channel)}>
                                <Icon name="video" /> Video
                            </button>

                            {channel?.userChannel ?

                                <button onClick={() => history.push(`/new-message/?user=${channel?.user}`)}>
                                    <Icon name="chat" /> Chat
                                </button>

                                : null}

                        </div>
                        {/* <h1>{channel.message}</h1> */}
                       
                    </header>

                    {channel?.userChannel ? <User userId={channel?.user} /> :

                        <>
                            <ul>

                                {showMessages()}
                                <li className="message first">
                                    <h2>
                                        Created by {channel?.user?.name}
                                    </h2>
                                    <h2>Members</h2>
                                    <div>{showMembers()}</div>
                                    <h2>Active Users in Video</h2>
                                    <div>{showActiveUsers()}</div>{ }
                                    <h2>Welcome #{channel?.message}!</h2>

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