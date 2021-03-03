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
      {/* <ul className="posts">
        <ShowPosts {...props} posts={posts} />
      </ul> */}
      {/* <ShowTransactions transactions={transactions} resolveTransaction={resolveTransaction} /> */}
    </div>
  )
}

// const ShowPosts = ({ posts }) => {
//   return posts.map((post) => {
//     return (
//       <li key={post._id}>
//         <Link to={`/post/${post._id}`}>{post.message}</Link>
//       </li>
//     )
//   })
// }

// const ShowTransactions = ({ transactions, resolveTransaction }) => {
//   return transactions.map(({ topic, amount, createdAt, _id, resolved }) => {
//     return (
//       <li key={_id}>
//         {topic}, {amount}, {createdAt}{' '}
//         {resolved ? null : <button onClick={resolveTransaction(_id)}>Cash out</button>}
//       </li>
//     )
//   })
// }

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

  let { user, setUser, history, gotoRoom } = useContext(TheContext)

  let outOfPoints = user?.points <= 0

  const handleSubmit = (e) => {
    e.preventDefault()

    // if (user?.calendly === "https://calendly.com/ Click here to set your calendly!")
    //     return alert('Please set your calendly before posting...')

    actions
      .addPost({ message, bounty })
      .then((res) => {
        setUser(res?.data.user)
        NotificationManager.info(`You've submitted a new issue`)
        gotoRoom(res.data.posted._id)
      })
      .catch((err) => console.error(err))
  }
  return (
    <div id="addPost">
      <section>
        <h3 id="player_stats">
          Welcome, <span>{user.name}</span>! You have: {user.points} cowbells 💰
        </h3>
        <form id="createRoom" onSubmit={handleSubmit}>
          <label htmlFor="bounty">
            <h2>Need help?</h2>
            Type your question below
          </label>
          <br />
          <input
            disabled={outOfPoints}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={outOfPoints ? 'Sorry your out of points' : `e.g: ${randomQuestion()}`}
            id="bounty"
            type="text"
          />
          <br />

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
          <br />

          <button disabled={outOfPoints}>Create Post</button>
        </form>
      </section>

      <section id="user-details">
        <h3>
          {user.encounters ? (
            <span>
              You've had {user.encounters.amount} encounter{user.encounters.amount != 1 ? 's' : ''}{' '}
              with a total time of
              {humanizeDuration(user.encounters.totalTime, 'hms')}
            </span>
          ) : (
            <span>Encounters not yet loaded</span>
          )}
        </h3>

        <h3>
          You are logged in as <span>{user.email}</span>
        </h3>
        {/* <h4>Qs are {Math.round(100 - (100 / process.env.ELECTRON_WEBPACK_APP_SALE))}% off.  {process.env.ELECTRON_WEBPACK_APP_BOUNTY} reward for only {Math.round(Number(process.env.ELECTRON_WEBPACK_APP_BOUNTY) / Number(process.env.ELECTRON_WEBPACK_APP_SALE))} points</h4> */}
      </section>
    </div>
  )
}

export default CreateRoom
