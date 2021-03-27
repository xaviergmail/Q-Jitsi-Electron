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

        fetchChannel(props.match.params.id)

    }, [props.match.params.id])

    const fetchChannel = async (id) => {
        let res = await actions.getPost(id)
        if (res) {
            setChannel(res.data.post)
            setMessages(res.data.messages)
        }
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
            <h1>{channel.message}</h1>
            <button>Messages</button>
            <button onClick={() => gotoRoom(channel.id, channel)}>=>Video</button>

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