import React, { useEffect, useContext, useState } from 'react';
import TheContext from '../TheContext'
import actions from '../api/index'



function Chat(props) {

    const { activeRooms, room, gotoRoom } = useContext(TheContext)
    console.log(activeRooms, room, ' activeRoomsactiveRoomsactiveRooms')
    const [channels, setChannels] = useState([])
    const [channel, setChannel] = useState({})
    const [messages, setMessages] = useState([])
    let [message, setMessage] = useState('')

    useEffect(() => {
        actions
            .getAllPosts()
            .then((res) => {
                console.log(res, ' let it be')
                setChannels(res.data)
            }).catch(console.error)

    }, [])

    const fetchChannel = ({ id }) => { //Maybe better as links in the future
        console.log(id)
        actions.getPost(id).then(res => {
            console.log(res)
            if (res) {
                setChannel(res.data.post)
                setMessages(res.data.messages)
            }
        }).catch(console.error)
    }

    const showChannels = () => {
        return channels.map(channel => (

            <li onClick={() => fetchChannel(channel)}>
                {channel.message}

            </li>
        ))
    }


    const showMessages = () => {
        return messages.map(({ message }) => (

            <li>
                {message}
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
            <h1> Chat</h1>

            <main>
                <div id="channels">
                    <label>Channels {channel.message}</label>
                    <ul>
                        {showChannels()}
                    </ul></div>

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


        </section>
    );
}

export default Chat;