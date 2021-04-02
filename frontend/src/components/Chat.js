import React, { useEffect, useContext, useState } from 'react';
import TheContext from '../TheContext'
import actions from '../api/index'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'
import moment from 'moment'


function Chat(props) {

    const { activeRooms, room, gotoRoom, posts } = useContext(TheContext)
    const [channels, setChannels] = useState([])
    const [channel, setChannel] = useState({})
    const [messages, setMessages] = useState([])
    let [message, setMessage] = useState('')

    useEffect(() => {

        fetchChannel(props.match.params.id)

    }, [props.match.params.id])

    const fetchChannel = async (id) => {

        let res = await actions.getPost(id)


        if (res) {
            setChannel(res.data.post)
            setMessages(res.data.messages.reverse())
        }
    }




    const showMessages = () => {
        let thisPost = posts[props.match.params.id];
        if (thisPost) {
            return [...thisPost.messageIds].reverse().map(({ message, userId, createdAt }) => (
                <li className="message">
                    <Image avatar src={userId?.avatar} style={{ background: 'white' }} />
                    <div>
                        <b class="name">{userId?.name} <i>{moment(createdAt).fromNow()}</i></b>
                        <p class="text">{message}</p>
                    </div>
                </li>
            ))
        }
    }


    const submitMessage = e => {
        e.preventDefault()
        actions
            .addMessage({ channel, message })
            .then(res => {


                // let m = [...messages]

                // m.unshift(res.data.message)
                // // m.unshift({ message: res.data.message.message })

                // setMessages(m)
                setMessage('')
            })
            .catch(console.error)
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
                        <h1>{channel?.message}</h1>
                        <div className="controls">
                            <button onClick={() => gotoRoom(channel._id, channel)}>
                                <Icon name="video" /> Video
                            </button>
                            <button onClick={() => gotoRoom(channel._id, channel)}>
                                <Icon name="laptop" /> Screen
                            </button>

                        </div>
                        {/* <h1>{channel.message}</h1> */}

                    </header>
                    <ul>
                        {showMessages()}
                    </ul>
                </div>

            </main>

            <form onSubmit={submitMessage}>
                <input type="text" value={message} placeholder="Say something... Earn a CowBell" onChange={e => setMessage(e.target.value)} />
                {/* <button>+</button> */}
                <button id="addMessage" disabled={false}><Icon name="add" /> <label></label></button>
            </form>


        </section>
    );
}

export default Chat;