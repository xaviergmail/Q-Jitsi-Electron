
import { push } from 'react-router-redux'
import { createConferenceObjectFromURL } from '../../../app/features/utils';

import React, { useEffect } from 'react';
import { connect } from 'react-redux';


function Room({jitsiApp, roomId, dispatch, location}) {
    console.log(location)
    useEffect(() => {
        //Change song that i want to play
        gotoRoom(dispatch, roomId)

        //CHANGE THE DAMN SONG >>> Forget everything you know 
        return () => dispatch(push('/'))
    }, [roomId])

    //Play song that i selected unless i already started playing
    return (
        <>
            {jitsiApp} 
        </>
    );
}

export default connect()(Room);

 function gotoRoom(dispatch, roomID) {
  
  const conference = createConferenceObjectFromURL(process.env.ELECTRON_WEBPACK_APP_JITSI_URL + "/" + roomID);
  conference.jwt = localStorage.token

  window._conference = conference
  window._push = push
  window._dispatch = dispatch

  //Play a new song / change song 
  dispatch(push('/conference', conference))
}
