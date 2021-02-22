import React from 'react'
import actions from '../../api/index'
import { GoogleLogin } from 'react-google-login'

const responseGoogle = (props) => {
  const onResponse = (response) => {
    console.log(response, 'googlsignuplol')
    if (!response.error) {
      actions
        .logIn(response.tokenId)
        .then((resp) => {
          if (!resp || resp.msg) {
            console.log('banana resp', resp)
            console.error('failed login', resp?.data?.msg)
          } else {
            console.log('woo lol you signed in ', resp.data)
            props.setJwt(resp.data.token)
          }
        })
        .catch((response) => console.error(response))
    }
  }
  return (
    <>
    {console.log(process.env, ' no doubt')}
      <GoogleLogin
        clientId={'956237608940-ne8lji466kjr51in8oldqvau9v1l8mjk.apps.googleusercontent.com'}
        buttonText="Log In"
        onSuccess={onResponse}
        onFailure={onResponse}
        cookiePolicy={'single_host_origin'}
      />
      <iframe style={{ pointerEvents: 'none' }} src="https://giphy.com/embed/whOs1JywNpe6c" width="480" height="360" />
    </>
  )
}

export default responseGoogle
