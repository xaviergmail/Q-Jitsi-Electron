import React, { useContext, useEffect, useState, createElement } from 'react';
import { Accordion, Header, Icon, Image, List, Menu, Sidebar, Card, Container } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import TheContext from '../TheContext';
import actions from '../api'

function Profile(props) {
    const { user, setUser, myTransactions, myPosts } = useContext(TheContext)


    let [transactions, setTransactions] = useState([])
    let [posts, setPosts] = useState([])
    let [avatar, setAvatar] = useState(user.avatar)



    const saveAvatar = (a) => {
        actions.saveAvatar(a).then(res => {
            console.log('avatar', res.data)
            //setAvatar(res.data.avatar)
            setUser(res.data)
        })
    }
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

    console.log('who me the log!!!')

    const ShowResolvedPosts = ({ posts }) => {
        console.log(posts, ' hmm')
        if (!posts) { return }
        const p = posts.filter(p => p.paid).map((post) => {

            let helpers = []
            for (let enc of post.encounterIds) {
                if (enc.email !== user.email && !helpers.find(each => each.email === enc.email) && enc.createdBy?.avatar) {
                    helpers.push(enc)
                }
            }
            console.log(post, 'post')

            return (
                <span key={post._id}>
                    <Link to={`/post/${post._id}`}>
                        {/* <li>{post.message} Paid:{JSON.stringify(post.paid)}</li> */}
                        <Card >
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
                                {helpers ? helpers.map(h => {
                                    console.log(h, 'h')
                                    return (
                                        <span key={h.avatar}>
                                            <h5>{h.name}</h5>
                                            <Image width="30" src={h.avatar} />
                                        </span>
                                    )
                                }) : null}
                                <br />
                                {helpers.length} Helper

                        </Card.Content>
                        </Card>
                </Link>
                </span>
            )
        })

        // p.unshift(createElement('div', { className: 'counter' }, `You've have resolved ${p.length} room${p.length > 1 ? 's' : ''}`))
        return p

    }




  const ShowTransactions = () => {
      console.log('transactions', transactions)
      if (!transactions) { return }
      const trans = transactions.map((tran) => {

        if (tran.resolved) {
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

                        {/* <button onClick={() => cashTransaction(tran._id)}> */}
                        <div>{tran.amount} 💰</div>

                        {/* </button> */}

                    </Card.Description>
                </Card.Content>
            </Card>
        )
      }

    })

    //   trans.unshift(createElement('div', { className: 'counter' }, `You've had ${trans.length} transaction${trans.length > 1 ? 's' : ''}`))
      return trans
  }



    return (
        <section className="profile">
            <Header as='h3'>

                Welcome {user.name}

            </Header>
            <Image src={user.avatar} avatar />

            <div className="avatars">
                {user.avatars ? user.avatars.map(a => a != user.avatar && <Image src={a} onClick={() => saveAvatar(a)} avatar />) : null}
            </div>






            <Container>
                <h4>{user.email}</h4>


                <h4><Link to="/settings">Settings</Link></h4>
                <button onClick={() => {
                    window.jitsiNodeAPI.ipc.send('gauth-clear')
                    //window.localStorage.clear()
                    localStorage.removeItem("googletoken")
                    localStorage.removeItem("token")
                    requestAnimationFrame(() => {
                        setUser(null)
                        window.location.reload()
                    })

                }}>Log Out</button>
                {/* <button onClick={() => {
                    window.jitsiNodeAPI.ipc.send('set-counter', { count: 20 })
                }}>Set Counter</button> */}
            </Container>


            <div className="profile-details">

                <div className="trans">
                {transactions.length > 0 ? (
                        <ul id="transactions">
                                <ShowTransactions />
                        </ul>
                ) : (
                            <>
                            <h2>No transactions yet!</h2>
                            <p>Go ask a question or help some people out!</p>
                            </>
                    )}
                </div>
                <div className="pooo">
                    <ul className="resolved">

                        <ShowResolvedPosts {...props} posts={posts} />
                    </ul>
                </div>
            </div>
            </section>
    );
}

export default Profile;




// const ShowResolvedPosts = ({ posts }) => {
//     return posts.filter(p => p.paid).map((post) => {
//         return [...new Set(post.encounterIds.map(e => {
//             if (e.email != user.email) {
//                 return e
//             }
//         }))]
//     })
// }

