import React, { useEffect, useContext, useState } from 'react';
import { Accordion, Header, Icon, Image, List, Menu, Sidebar, Card, Container } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'

import actions from '../api'


function User(props) {

    let [user, setUser] = useState({})

    useEffect(() => {
        console.log(props, props.match.params.id)
        fetchUser(props.match.params.id)

    }, [])

    async function fetchUser(id) {
        console.log(id)
        let { data } = await actions.getUserProfile(id)
        console.log(data)
        setUser(data?.user)

    }

    return (
        <div>
            User
            <section className="profile">
                <Header as='h3'>

                    {user.name}
                </Header>
                <Link to={`/chat/${user?.postId?._id}`}>Send Message</Link>

                <Image src={user.avatar} avatar />
            </section>

        </div>
    );
}

export default User;