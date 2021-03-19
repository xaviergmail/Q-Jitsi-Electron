import React, { useEffect, useState } from 'react'
import actions from '../api'
import moment, { updateLocale } from 'moment'

const Post = ({ history, match, user }) => {
  const [post, setPost] = useState({})
  const [encounters, setEncounters] = useState([])
  // const [transactions, setTransactions] = useState([]);
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    actions
      .getPost(match.params.id)
      .then((res) => {
        console.log(res)
        if (res) {
          setPost(res?.data)
          //   setTransactions(res?.data.transactions);
          setEncounters(res?.data?.encounterIds)
        }
      })
      .catch(console.error)
  }, [match.params.id])

  const toggleHelpers = ({ email }) => (e) => {
    if (e.target.checked) {
      setParticipants([...participants, email])
    } else {
      let newHelpers = participants.filter((helper) => helper !== email)
      setParticipants(newHelpers)
    }
  }

  const resolveThePost = (e) => {
    actions
      .resolvePost({ participants, post })
      .then((res) => {
        console.log(res)
        history.push('/create-room')
      })
      .catch(console.error)
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

  const showEncounters = () => {
    if (!encounters) { return } //FIXME
    return encounters
      .filter((participant) => {
        return participant.email !== user?.email
      })
      .map((enc) => {
        return (
          <li className="post" key={enc._id}>
            <p>
              {enc.email} visited you on {moment(enc.join_time).format('MMMM Do YYYY, h:mm:ss')} for{' '}
              {moment
                .utc(
                  moment
                    .duration(
                      (new Date(enc.leave_time).getTime() - new Date(enc.join_time)) / 1000,
                      'minutes'
                    )
                    .asMilliseconds()
                )
                .format('HH:mm')}{' '}
              minutes...
            </p>
            {/* <i>
              {console.log(typeof enc.leave_time, enc.leave_time, new Date(enc.leave_time).getTime())}
              <h2>{humanizeDuration(new Date(enc.leave_time).getTime() - new Date(enc.join_time), 'hms')}</h2>
              came in from {moment(enc.join_time).format('MMMM Do YYYY, h:mm:ss a')} until{' '}
              {moment(enc.leave_time).format('MMMM Do YYYY, h:mm:ss a')}
            </i> */}
            <input type="checkbox" onChange={toggleHelpers(enc)} /> {enc.email} helped me.
          </li>
        )
      })
  }

  /*
    const showTransactions = () => {
        return transactions.map((tran) => {
            return (
                <li key={tran._id}>
                    transaction: {tran.email} : {tran.totalTime}
                </li>
            );
        });
    };
*/

  const showHelpers = () => {
    return participants
      .filter((participant) => {
        return participant.email !== user?.email
      })
      .map((eachHelper) => (
        <li>
          Pay {eachHelper} {post.bounty / participants.length} points
        </li>
      ))
  }

  console.log(post, participants)

  return (
    <div className="post-detail">
      <section>
        <h1>Viewing details for your post:</h1>
        <h2>{post?.message}</h2>
        <h3>Bounty {post?.bounty}</h3>

        {post?.paid ?
          <h3>Post has been paid</h3>
          :
          <>
            <ul>{showHelpers()}</ul>
            {participants.length > 0 ? (
              <button id="pay" onClick={resolveThePost}>
                Pay Helpers & Resolve Post
          </button>
            ) : null}
          </>
        }

      </section>
      {/* <section>
                <div>Transactions</div>
                {showTransactions()}
            </section> */}
      {post?.paid ? null : <ul id="showEncounters">{showEncounters()}</ul>}
    </div>
  )
}

export default Post
