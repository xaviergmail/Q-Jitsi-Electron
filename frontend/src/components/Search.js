import React, { Fragment, useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import moment from 'moment'
import { connect } from 'react-redux'

import TheContext from '../TheContext'
import actions from '../api'

const CreateRoom = (props) => {
    const [posts, setPosts] = useState([])
    const [transactions, setTransactions] = useState([])

    useEffect(() => {
        //Get my posts
        actions
            .getMyPosts()
            .then((posts) => {
                if (posts) setPosts(posts.data.reverse())
            })
            .catch((err) => console.error(err))

        actions
            .getMyTransactions()
            .then((transactions) => {
                if (transactions) setTransactions(transactions.data.reverse())
            })
            .catch((err) => console.error(err))
    }, [])

    const resolveTransaction = (id) => (e) => {
        actions
            .cashOut({ id })
            .then((res) => {
                let newTransactions = [...transactions.filter((t) => t._id !== res.data.transaction._id)]
                setTransactions(newTransactions)
            })
            .catch((err) => console.error(err))
    }

    return (
        <div className="page profile">
            <AddPost {...props} posts={posts} />
        </div>
    )
}



const questions = [
    'Why is earth flat?',
    "My flexbox isn't flexible..?",
    'HOW DO I TURN CAPLOCK OFF?',
    'Why is NaN !== NaN?!?',
    'typeof {} + function(){} ??',
    "Why is (true == 'true') === false?",
    "What is 'this'?",
    "Why is typeof NaN === 'number'?",
]
function randomQuestion() {
    return questions[~~(Math.random() * questions.length)]
}

function humanizeDuration(input, units) {
    // units is a string with possible values of y, M, w, d, h, m, s, ms
    var duration = moment().startOf('day').add(units, input),
        format = ''
    if (duration.hour() > 0) {
        format += 'H [hours] '
    }
    if (duration.minute() > 0) {
        format += 'm [minutes] '
    }
    format += ' s [seconds]'
    return duration.format(format)
}

const AddPost = ({ posts }) => {
    const [message, setMessage] = useState('')
    const [bounty, setBounty] = useState(10)
    let [focus, setFocus] = useState(false)

    let { user, setUser, history, gotoRoom, filterRooms } = useContext(TheContext)

    let outOfPoints = user?.points <= 0

    const handleChange = e => {
        setMessage(e.target.value)
        filterRooms(e.target.value)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // if (user?.calendly === "https://calendly.com/ Click here to set your calendly!")
        //     return alert('Please set your calendly before posting...')
        setFocus(false)

        actions
            .addPost({ message, bounty })
            .then((res) => {
                setUser(res?.data.user)
                console.log(res.data, ' <<>>> THIS ISH BUSNATCH')
                // NotificationManager.info(`You've submitted a new issue`)
                gotoRoom(res.data.posted._id)
            })
            .catch((err) => console.error(err))
    }
    return (
        <section id="addPost">


            <form id="createRoom" onFocus={() => setFocus(true)}
                // onBlur={() => setFocus(false)} 
                onSubmit={handleSubmit}>

            
                <input
                    disabled={outOfPoints}
                    onChange={handleChange}
                    value={message}
                    placeholder={outOfPoints ? 'Sorry your out of points' : `e.g: ${randomQuestion()}`}
                    id="bounty"
                    type="text"
                />
                {focus ? <button disabled={outOfPoints}>+</button> : null}
            </form>

                {focus ?
                <>
                      

                    <div className="details">

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
                        <label htmlFor="cowbell">Bounty: {bounty} cowbells</label>


                    </div>
                </>
                : null}
        </section>



    )
}

export default CreateRoom
