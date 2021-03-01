import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import randomWords from 'random-words'
import moment from 'moment'
import actions from '../api'

function Dashboard(props) {
  let [transactions, setTransactions] = useState([])
  let [posts, setPosts] = useState([])

  useEffect(() => {
    actions
      .getMyTransactions()
      .then((res) => {
        setTransactions(res.data)
      })
      .catch((err) => {
        console.log(err)
      })


    actions
      .getMyPosts()
      .then(res => {
        setPosts(res.data)
      }).catch((err) => {
        console.log(err)
      })


  }, [])

  const cashTransaction = (id) => {
    actions
      .cashOut({ id })
      .then((res) => {
        setTransactions(transactions.filter((each) => each._id !== res.data.transaction._id))
      })
      .catch((err) => console.error)
  }

  const showTransactions = () => {
    return transactions.map((tran) => {
      return (
        <li key={tran._id}>
          <h2>{tran.postId?.message}</h2>
          {/* <h2>{tran.message}</h2> */}

          <span>{moment(tran.createdAt).fromNow()}</span>
          <div>
            <h6>{tran.kind}</h6>
            <h2>{tran.amount}💰</h2>
          </div>
          {tran.resolved ? (
            <h5>Already Claimed</h5>
          ) : (
            <button onClick={() => cashTransaction(tran._id)}>Cash Out</button>
          )}
        </li>
      )
    })
  }




  const ShowPosts = ({ posts }) => {
    return posts.map((post) => {
      return (
        <Link to={`/post/${post._id}`} key={post._id}>
          <li>{post.message}</li>
        </Link>
      )
    })
  }

  console.log(transactions)

  return (
    <div className="page dashboard">
      Dashboard
      <ul id="transactions">
        {transactions.length > 0 ? (
          showTransactions()
        ) : (
            <div className="noneyet">
              <h2>No transactions yet!</h2>
              <p>Go ask a question or help some people out!</p>
            </div>
          )}
      </ul>

      <ul className="posts">
        {posts.length > 0 ? (
          <>
            Posts that you need to resolve
            <ShowPosts {...props} posts={posts} />
          </>
        ) : null}
      </ul>
    </div>
  )
}

export default Dashboard
