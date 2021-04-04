import React, { createElement, useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import randomWords from 'random-words'
import moment from 'moment'
import actions from '../api'
import { Accordion, Header, Icon, Image, List, Menu, Sidebar, Card, Container } from 'semantic-ui-react'

import TheContext from '../TheContext'

function Dashboard(props) {
  let [transactions, setTransactions] = useState([])
  let [posts, setPosts] = useState([])

  const { user, setUser, setMyPosts, myPosts, setMyTransactions, myTransactions } = useContext(TheContext)

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
        console.log("inactive", res.data)
        setPosts(res.data)
      }).catch((err) => {
        console.log(err)
      })


  }, [])

  const cashTransaction = (id) => {
    actions
      .cashOut({ id })
      .then((res) => {
        console.log(res, user)
        setUser(res.data.user)
        let i = 0;

        //For coin animation later 
        // while (i < res.data.user.points) {
        //   //console.log(i)
        //   i++
        // setTimeout(() => setUser(res.data.user), i*100)
        //}

        setTransactions(transactions.filter((each) => each._id !== res.data.transaction._id))
      })
      .catch((err) => console.error)
  }



  const ShowTransactions = () => {
    const t = transactions.map((tran) => {
      if (!tran.resolved) {
        return (
          <Card key={tran._id}>
            {/* <Image src='/images/avatar/large/matthew.png' ui={false} /> */}
            <Card.Content>
              <Card.Meta>
                <span className='date'>{tran.kind}</span>
              </Card.Meta>
              <Card.Meta>
                <span className='date'>{moment(tran.createdAt).fromNow()}</span>
              </Card.Meta>
              <Card.Header>{tran.postId?.message ? tran.postId?.message : tran.message}</Card.Header>
              <Card.Meta>
              </Card.Meta>
              <Card.Description>

                <button onClick={() => cashTransaction(tran._id)}>
                  <div>{tran.amount} 💰</div>

                </button>

              </Card.Description>
            </Card.Content>
          </Card>
        )
      }
    }).filter(x => x)
    t.unshift(createElement('div', { className: 'counter' }, `You've earned ${t.length} transaction${t.length > 1 ? 's' : ''}`))
    return t
  }



  const ShowUnresolvedPosts = ({ posts }) => {
    const p = posts.filter(p => !p.paid).map((post) => {

      let helpers = []
      for (let enc of post.encounterIds) {
        if (enc.email !== user.email && !helpers.find(each => each.email === enc.email) && enc.createdBy?.avatar) {
          helpers.push(enc.createdBy)
        }
      }





      if (helpers.length > 0) {
        return (

          <Link to={`/post/${post._id}`} key={post._id}>
            {/* <li>{post.message} Paid:{JSON.stringify(post.paid)}</li> */}
            <Card>
              {/* <Image src='/images/avatar/large/matthew.png' ui={false} /> */}
              <Card.Content>
                <Card.Header>{post.message}</Card.Header>
                <Card.Meta>
                  <span className='date'>{moment(post.updatedAt).format('MM-DD-YYYY')}</span>
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
                      <Image width="30" src={h?.avatar} />
                    </>
                  )
                })}
                <br />
                {helpers.length} Helper

                    </Card.Content>
            </Card>
          </Link>

        )
      }
    }).filter(x => x)

    // p.unshift(createElement('div', { className: 'counter' }, `You need to resolve ${p.length} room${p.length > 1 ? 's' : ''}`))
    return p
  }






  return (



    <section className="page dashboard">
      <Header as='h3'>
        Your Dashboard
        {/* <span id="money">💰</span> You have {user.points} Cowbells */}
      </Header>
      <Container></Container>
      {posts.length > 0 ? (

        <>
          <ul className="unresolved">

            <ShowUnresolvedPosts {...props} posts={posts} />
          </ul>
        </>

      ) : null}

      {transactions.length > 0 ? (
        <>

          <ul id="transactions">

            <ShowTransactions />
          </ul>
        </>
      ) : (
        <div className="noneyet">
          <h2>No transactions yet?</h2>
          <p>Go ask a question or help some people out!</p>
        </div>
      )}



    </section>
  )
}

export default Dashboard
