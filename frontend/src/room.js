import { push } from 'react-router-redux'
import { createConferenceObjectFromURL } from '../../app/features/utils';


export default function gotoRoom(dispatch, roomID) {
  
  const conference = createConferenceObjectFromURL(process.env.ELECTRON_WEBPACK_APP_JITSI_URL + "/" + roomID);
  conference.jwt = localStorage.token

  dispatch(push('/conference', conference))
}
//ok