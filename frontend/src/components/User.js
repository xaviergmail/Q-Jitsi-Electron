import React, { useEffect, useContext, useState } from 'react';
import { Accordion, Header, Icon, Image, List, Menu, Sidebar, Card, Container } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'

import actions from '../api'


function User(props) {

    // let [user, setUser] = useState({})

    // useEffect(() => {
    //     console.log(props?.userId, ' 2392938')
    //     let id = props?.userId || props?.match?.params?.id
    //     fetchUser(id)

    // }, [props])

    // async function fetchUser(id) {
    //     console.log(id)
    //     let { data } = await actions.getUserProfile(id)
    //     console.log(data)
    //     setUser(data?.user)

    // }

    return (
        <div>
            User
            <section className="profile">
                <Header as='h3'>

                    {props?.userId.name}
                </Header>
                <h4>{props?.userId.points - 10} 💰</h4>
                {/* <Link to={`/chat/${props?.userId?.postId?._id}`}>Send Message</Link> */}

                <Image src={props?.userId.avatar} avatar />
            </section>

        </div>
    );
}

export default User;