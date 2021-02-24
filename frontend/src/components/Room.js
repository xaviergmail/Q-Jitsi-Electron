
import { push } from 'react-router-redux'
import { createConferenceObjectFromURL } from '../../../app/features/utils';

import React, { useEffect } from 'react';
import { connect } from 'react-redux';


function Room({jitsiApp, roomId, dispatch}) {
    console.log(jitsiApp)
    useEffect(() => {
        gotoRoom(dispatch, roomId)
    }, [])
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
  console.log("dispatch", dispatch)
  console.log("push", push)
  console.log("conference", conference)
  window._conference = conference
  window._push = push
  window._dispatch = dispatch

  dispatch(push('/conference', conference))
}
