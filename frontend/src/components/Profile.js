import React, { useContext, useEffect, useState } from 'react';
import { Accordion, Header, Icon, Image, List, Menu, Sidebar, Card, Container } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import TheContext from '../TheContext';
import actions from '../api'

function Profile(props) {
    const { user, setUser, myTransactions, myPosts } = useContext(TheContext)


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


    const ShowResolvedPosts = ({ posts }) => {
        return posts.filter(p => p.paid).map((post) => {

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


    const ShowTransactions = () => {
        return transactions.map((tran) => {
            if (tran.resolved) {
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
                        {/* <button onClick={() => cashTransaction(tran._id)}>Cash Out</button> */}
                        <h5>Already Claimed</h5>

                    </li>
                )
            }
        })
    }

    console.log(transactions, posts, 'argh webpack')
    return (
        <section className="profile">
            <Header as='h3'>

                <Image src={user.avatar} avatar />

                Welcome {user.name}


            </Header>

            <Container>
                <h4>{user.email}</h4>

                <h4>{JSON.stringify(user.encounters)}</h4>


            </Container>


            <ul>
                {transactions.length > 0 ? (
                    <>
                        <h4>Past Transactions</h4>
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
            </ul>

            <h4>Past Posts </h4>
            <ul className="resolved">
                <ShowResolvedPosts {...props} posts={posts} />
            </ul>
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

