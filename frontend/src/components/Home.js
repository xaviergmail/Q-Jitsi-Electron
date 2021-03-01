import React, { useContext } from 'react'
import { Link } from 'react-router-dom'

import TheContext from '../TheContext'

const PostPreview = ({ post }) => (
  <li className="post" key={post._id}>
    <div class="post-info">
      <h2 className="message"> {post.message} </h2> <h2 className="bounty"> {post.bounty} 💰 </h2>
    </div>
    {/* // <p> Total Users: {post.activeUsers.length} </p> */}

    <Link to={`/room/${post._id}`}>
      <section>
        {post?.activeUsers?.length ? (
          <>
            {post.activeUsers.map((user) => (
              <div
                className="stream"
                key={user.email}
                style={{
                  background: '#' + (((1 << 24) * Math.random()) | 0).toString(16),
                }}
              >
                {user.name}
                <img src={user.avatar} />
              </div>
            ))}
          </>
        ) : null}
      </section>
    </Link>
    {/* <Link to={`post/${post._id}`}>Details </Link> */}
  </li>
)

const Home = (props) => {
  let { posts } = useContext(TheContext)
  console.log(posts, posts.length)

  const ShowPosts = () => {
    return Object.values({ ...posts }).map((post) => {
      return post.active ? <PostPreview key={post._id} post={post} /> : null
    })
  }

  return (
    <div className="home">
      <h1>🐮   <strong>Cow Bell 1.0.5!!!</strong>   🔔</h1>
      <button className="call-to-action">
        <Link to="/profile">Ring for help...</Link>
      </button>
      <ul className="rooms">
        {Object.keys(posts || {}).length > 0 ? <ShowPosts /> : <h2></h2>}
      </ul>
    </div>
  )
}

export default Home
