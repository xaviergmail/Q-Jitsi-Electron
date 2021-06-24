import React, { useEffect, useContext, useState, useRef } from 'react';
import TheContext from '../TheContext'
import actions from '../api/index'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'
import moment from 'moment'


function NewMessage(props) {

    const { user, history } = useContext(TheContext)
    const refInput = useRef();

    const [channel, setChannel] = useState(null)
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
        const { current } = refInput;
        console.log(current, 'current')
        current ? current.focus() : null
        // inputEl.current.focus();
        // selectedUsers.length > 0 ? current.focus() : null

    }, [])



    const fetchUsers = async () => {

        let res = await actions.getAllUsers()

        let selectUserId = new URLSearchParams(history.location.search).get('user')
        if (selectUserId) {
            handleClick([res.data.find(user => user._id === selectUserId)])
        }
        setAllUsers(res.data)


    }



    const submitMessage = e => {

        e.preventDefault()

        if (selectedUsers.length < 1) {
            return alert('Must select atleast one user')
        }
        //Create Channel


        // actions
        //     .addMessage({ message: selectedUsers.map(u => u.name).join(' & '), members: selectedUsers })
        //     .then(res => {
        //         console.log('then ', res.data)

                //I think res.data.post is channel 
        actions.addMessage({ message, channel, members: selectedUsers }).then(res => {
            history.push(`/chat/${res.data.post?._id}`)
            setMessage('')
        }).catch(console.error)


            // }).catch(console.error)
    }



    const handleClick = (users) => {
        setSelectedUsers(users)
        setUserQuery('')
        actions.findPreviousChat(users).then(res => {
            console.log(res, 'prev chat')
            setChannel(res.data)
        })
    }


    const showSelectedUsers = () => {
        console.log(selectedUsers, 'setSelectedUsers')
        if (selectedUsers) {
        return selectedUsers.map(sUser =>
            <li onClick={() => { handleClick(selectedUsers.filter(u => u._id != sUser._id)) }}>
                <Image avatar src={sUser.avatar} style={{ background: "white" }} />
                <span>{sUser.name}</span>

            </li>)
        }
    }

    const showUsers = () => {
        return allUsers.filter(u => u.name.toLowerCase().includes(userQuery) && !selectedUsers.some(one => one._id == u._id) && u._id != user._id).map(user =>
            <li onClick={() => { handleClick([...selectedUsers, user]) }}>
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



                        <div id="selectedUsers">
                        {showSelectedUsers()}




                            <form id="searchUsers" onSubmit={e => e.preventDefault()}>
                                <Icon name="search" id="search" />
                                <input
                                    value={userQuery}
                                    onChange={handleChange}
                                    placeholder="Find User"
                                    type="text"
                                />
                                {/* <button id="addMessage" disabled={false}>
                                    <Icon name="add" />
                                    <label></label>
                                </button> */}
                            </form>

                        </div>

                        {/* {selectedUsers.length > 0 ? */}
                        <div>
                            <h4>Private Message Users</h4>

                            <form className="addNewMessage" onSubmit={submitMessage} >
                                <input type="text" ref={refInput} value={message} placeholder={`Say something to: ${selectedUsers.map(u => u.name).join(' & ')}`} onChange={e => setMessage(e.target.value)} />
                                <button id="addMessage" disabled={false}><Icon name="chat" /> <label>Send</label></button>
                            </form>
                        </div>


                    </header>
                    <div className="moreUsers">
                        <h4>Click on a user to start a private chat</h4>
                        <ul id="unselectedUsers">
                            {showUsers()}
                        </ul>
                    </div>
                    {/* <ul>

                        <li className="message first">
                            <h2>Hi #{selectedUsers.map(u => u.name).join(' & ')}!</h2>
                            <p>This is the beginning of your chat history...</p>
                        </li>
                    </ul> */}
                </div>

            </main>




        </section>
    );
}

export default NewMessage;