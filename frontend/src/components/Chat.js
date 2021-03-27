import React, { useEffect, useContext, useState } from 'react';
import TheContext from '../TheContext'
import actions from '../api/index'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'



function Chat(props) {

    const { activeRooms, room, gotoRoom } = useContext(TheContext)
    console.log(activeRooms, room, ' activeRoomsactiveRoomsactiveRooms')
    const [channels, setChannels] = useState([])
    const [channel, setChannel] = useState({})
    const [messages, setMessages] = useState([])
    let [message, setMessage] = useState('')

    useEffect(() => {
        console.log('firigin', props.match.params.id)
        fetchChannel(props.match.params.id)

    }, [props.match.params.id])

    const fetchChannel = async (id) => {
        console.log(id, ' looking here')
        let res = await actions.getPost(id)
        if (res) {
            setChannel(res.data.post)
            setMessages(res.data.messages)
        }
    }




    const showMessages = () => {
        console.log(messages, channel)
        return messages.map(({ message, userId }) => (
            
            <li className="message">
                <Image avatar src={userId?.avatar} style={{ background: 'white' }} />
                <div>
                    <b class="name">{userId?.name}</b>
                    <p class="text">{message}</p>
                </div>
            </li>
        ))
    }


    const submitMessage = e => {
        e.preventDefault()
        console.log(message)
        actions
            .addMessage({ channel, message })
            .then(res => {
                console.log(res)

                let m = [...messages]
                console.log(m, ' wtf')
                m.push({ message: res.data.message.message })
                console.log(m, ' holy cow')
                setMessages(m)
            })
            .catch(console.error)
    }
    

    return (
        <section id="chat">
            <h1>{channel.message}</h1>
            <button onClick={() => gotoRoom(channel._id, channel)}>=>Video</button>

            <main>
                {/* <div id="channels">
                    <label>Channels {channel.message}</label>
                    <ul>
                        {showChannels()}
                    </ul></div> */}

                <div id="messages">
                    <label>Messages</label>
                    <ul>
                        {showMessages()}
                    </ul>
                </div>

            </main>

            <form onSubmit={submitMessage}>
                <input type="text" onChange={e => setMessage(e.target.value)} />
                <button>+</button>
            </form>

            <style>

            </style>
        </section>
    );
}

export default Chat;