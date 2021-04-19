import React, { useEffect, useContext, useState } from 'react';
import TheContext from '../TheContext'
import actions from '../api/index'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'
import moment from 'moment'


function NewMessage(props) {

    const { user, history } = useContext(TheContext)

    const [channel, setChannel] = useState({ message: '' })
    const [allUsers, setAllUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([])
    let [message, setMessage] = useState('')
    const [userQuery, setUserQuery] = useState('')

    const handleChange = e => {
        console.log(e.target.value)
        setUserQuery(e.target.value)
    }




    useEffect(() => {

        fetchUsers()

        console.log(props, ' ill be alriught')
    }, [])



    const fetchUsers = async () => {

        let res = await actions.getAllUsers()

        let selectUserId = new URLSearchParams(history.location.search).get('user')
        if (selectUserId) {
            setSelectedUsers([res.data.find(user => user._id === selectUserId)])
        }
        setAllUsers(res.data)
    }



    const submitMessage = e => {
        console.log(message, ' om dos')
        e.preventDefault()
        actions
            .addMessage({ message: userQuery, members: selectedUsers })
            .then(res => {
                console.log('then ', res.data)
                history.push(`/chat/${res.data.post?._id}`)
                setMessage('')
            })
            .catch(console.error)
    }
    const showSelectedUsers = () => {
        console.log(selectedUsers, 'setSelectedUsers')
        if (selectedUsers) {
        return selectedUsers.map(sUser =>
            <li onClick={() => setSelectedUsers(selectedUsers.filter(u => u._id != sUser._id))}>
                <Image avatar src={sUser.avatar} style={{ background: "white" }} />
                <span>{sUser.name}</span>

            </li>)
        }
    }

    const showUsers = () => {
        return allUsers.filter(u => u.name.toLowerCase().includes(userQuery) && !selectedUsers.some(one => one._id == u._id) && u._id != user._id).map(user =>
            <li onClick={() => setSelectedUsers([...selectedUsers, user])}>
                <Image avatar src={user.avatar} style={{ background: "white" }} />
                <span>{user.name}</span>

            </li>

        )
    }

    return (
        <section id="new-message">

            <main>


                <div id="messages">
                    <header className="message-title">
                        {showSelectedUsers()}

                        <form id="searchUsers"

                            onSubmit={submitMessage}>

                            <Icon name="search" id="search" />
                            <input
                                value={userQuery}
                                onChange={handleChange}
                                placeholder="Direct Message @someone"


                                type="text"
                            />
                            {/* <button id="addRoom" className={showSlider ? 'show' : 'hide'}><Icon name="add" /></button> */}
                            <button id="addMessage" disabled={false}><Icon name="add" /> <label></label></button>
                        </form>
                        <h1>{selectedUsers.map(u => u.name).join(' & ')}</h1>
                        <ul>
                            {showUsers()}
                        </ul>
                        {/* <div className="controls">
                            <button onClick={() => gotoRoom(channel._id, channel)}>
                                <Icon name="video" /> Video
                            </button>
                            <button onClick={() => gotoRoom(channel._id, channel)}>
                                <Icon name="laptop" /> Screen
                            </button>

                        </div> */}
                        {/* <h1>{channel.message}</h1> */}

                    </header>

                    <ul>

                        <li className="message first"><h2>Hi #{selectedUsers.map(u => u.name).join(' & ')}!</h2><p>This is the beginning of your chat history...</p></li>
                    </ul>
                </div>

            </main>

            {/* <form onSubmit={submitMessage}>
                <input type="text" value={message} placeholder="Say something... Earn a CowBell" onChange={e => setMessage(e.target.value)} />
                <button id="addMessage" disabled={false}><Icon name="add" /> <label></label></button>
            </form> */}


        </section>
    );
}

export default NewMessage;