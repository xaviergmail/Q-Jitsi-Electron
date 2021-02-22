import { push } from 'react-router-redux'
import { createConferenceObjectFromURL } from '../../app/features/utils';


console.log("ROOM JS LOADED!!!")
export default function gotoRoom(dispatch, roomID) {
  
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

window._gotoRoom = gotoRoom