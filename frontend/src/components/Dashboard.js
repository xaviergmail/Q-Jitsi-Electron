import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import randomWords from 'random-words'
import moment from 'moment'
import actions from '../api'
import { Accordion, Header, Icon, Image, List, Menu, Sidebar, Card, Container } from 'semantic-ui-react'

import TheContext from '../TheContext'

function Dashboard(props) {
  // let [transactions, setTransactions] = useState([])
  // let [posts, setPosts] = useState([])

  const { user, setUser, setMyPosts, myPosts, setMyTransactions, myTransactions } = useContext(TheContext)

  // useEffect(() => {
  //   actions
  //     .getMyTransactions()
  //     .then((res) => {
  //       setTransactions(res.data)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })


  //   actions
  //     .getMyPosts()
  //     .then(res => {
  //       setPosts(res.data)
  //     }).catch((err) => {
  //       console.log(err)
  //     })


  // }, [])

  const cashTransaction = (id) => {
    actions
      .cashOut({ id })
      .then((res) => {
        console.log(res, user)
        setUser(res.data.user)
        let i = 0;
        while (i < res.data.user.points) {
          console.log(i)
          i++
          // setTimeout(() => setUser(res.data.user), i*100)
        }

        setMyTransactions(myTransactions.filter((each) => each._id !== res.data.transaction._id))
      })
      .catch((err) => console.error)
  }

  const ShowTransactions = () => {
    return myTransactions.map((tran) => {
      if (!tran.resolved) {
        return (
          <li key={tran._id}>
            <h2>{tran.postId?.message}</h2>
            {/* <h2>{tran.message}</h2> */}

            <span>{moment(tran.createdAt).fromNow()}</span>
            <div>
              <h6>{tran.kind}</h6>
              <h2>{tran.amount}💰</h2>
            </div>
            {/* {tran.resolved ? (
            <h5>Already Claimed</h5>
          ) : (
              <button onClick={() => cashTransaction(tran._id)}>Cash Out</button>
            )} */}
            <button onClick={() => cashTransaction(tran._id)}>Cash Out</button>

          </li>
        )
      }
    })
  }




  // const ShowPosts = ({ posts }) => {
  //   console.log(posts)
  //   return posts.filter(p => !p.paid && p.encounterIds.filter(e => e.email != user.email).length > 0).map((post) => {
  //     return (
  //       <Link to={`/post/${post._id}`} key={post._id}>
  //         <li>{post.message} Paid:{JSON.stringify(post.paid)}</li>
  //       </Link>
  //     )
  //   })
  // }

  const ShowUnresolvedPosts = ({ posts }) => {
    return posts.filter(p => !p.paid).map((post) => {

      let helpers = []
      for (let enc of post.encounterIds) {
        if (enc.email !== user.email && !helpers.find(each => each.email === enc.email) && enc.avatar) {
          helpers.push(enc)
        }
      }


      return (
        <li>
          <Link to={`/post/${post._id}`} key={post._id}>
            {/* <li>{post.message} Paid:{JSON.stringify(post.paid)}</li> */}
            <Card>
              {/* <Image src='/images/avatar/large/matthew.png' ui={false} /> */}
              <Card.Content>
                <Card.Header>{post.message}</Card.Header>
                <Card.Meta>
                  <span className='date'>{post.updatedAt}</span>
                </Card.Meta>
                <Card.Description>
                  {post.bounty} 💰
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Icon name='user' />
                {helpers.map(h => {
                  return (
                    <>
                      <h5>{h.name}</h5>
                      <Image width="30" src={h.avatar} />
                    </>
                  )
                })}
                <br />
                {helpers.length} Helper

                    </Card.Content>
            </Card>
          </Link>
        </li>
      )
    })
  }






  return (



    <section className="page dashboard">
      <Header as='h3'>

        <h1>💰</h1> You have {user.points} Cowbells
      </Header>
      <Container></Container>
      {myPosts.length > 0 ? (

        <>
          <h4>Posts that you need to resolve:</h4>
          <ul className="unresolved">

            <ShowUnresolvedPosts {...props} posts={myPosts} />
          </ul>
        </>

      ) : null}

      {myTransactions.length > 0 ? (
        <>
          <h4>Transactions</h4>
          <ul id="transactions">
            <ShowTransactions />
          </ul>
        </>
      ) : (
          <div className="noneyet">
            <h2>No transactions yet!</h2>
            <p>Go ask a question or help some people out!</p>
          </div>
        )}



    </section>
  )
}

export default Dashboard
