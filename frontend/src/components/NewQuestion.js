import React, { useEffect, useContext, useState } from 'react';
import TheContext from '../TheContext'
import actions from '../api/index'
import { Divider, Header, Icon, Image, List, Menu, Sidebar } from 'semantic-ui-react'
import moment from 'moment'
import Search from './Search'
import { Link } from 'react-router-dom'



function NewQuestion(props) {

    const { user, history, posts, bounty, setBounty, setUser, gotoRoom, filterRooms, showSlider, setShowSlider, open, setOpen } = useContext(TheContext)


    let outOfPoints = user?.points <= 0;

    const [message, setMessage] = useState('')

    const showPosts = () => {
        return Object.values(posts)
            .filter(post => !post.userChannel && !post.dmChannel)
            .filter(post => post.message.toLowerCase().includes(message.toLowerCase()))
            .map(post => (
                <Link to={`chat/${post._id}`}><li>{post.message}</li></Link>
            ))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        setMessage('')

        actions
            .addPost({ message, bounty })
            .then((res) => {
                setUser(res?.data.user)
                // console.log(res.data, ' <<>>> THIS ISH BUSNATCH')
                // NotificationManager.info(`You've submitted a new issue`)
                // gotoRoom(res.data.posted._id) //SENDS TO VIDEO 
                history.push(`/chat/${res.data.posted._id}`)
                setBounty(10)
            })
            .catch((err) => console.error(err))
    }

    return (


        <section id="new-question">
            <main>


                <div id="messages">
                    <header className="message-title">

                        <h4>Click on a user to start a private chat</h4>

                        <form id="searchUsers" onSubmit={handleSubmit}>
                            <input

                                placeholder="Ask a Question.  Create a room."
                                onChange={e => setMessage(e.target.value)}

                                type="text"
                            />
                            <button id="addMessage" disabled={false}><Icon name="add" /> <label></label></button>
                        </form>
                        <div className="details">
                            <label htmlFor="cowbell">{bounty} 💰</label>

                            <input
                                type="range"
                                id="cowbell"
                                name="cowbell"
                                min="10"
                                max={user.points}
                                defaultValue={bounty}
                                onChange={(e) => setBounty(e.target.value)}
                                step="10"
                                placeholder={outOfPoints ? "Sorry, you're all out of points" : `Put your bounty here`}
                                disabled={outOfPoints}
                            />


                        </div>
                        <ul className="showPosts">
                            {showPosts()}
                        </ul>

                    </header>


                </div>

            </main>

            {/* <form onSubmit={submitMessage}>
                <input type="text" value={message} placeholder="Say something... Earn a CowBell" onChange={e => setMessage(e.target.value)} />
                <button id="addMessage" disabled={false}><Icon name="add" /> <label></label></button>
            </form> */}


        </section>
    );
}

export default NewQuestion;