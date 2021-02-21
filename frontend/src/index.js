import React from 'react'
import ReactDOM from 'react-dom'
import 'react-notifications/lib/notifications.css'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,

  document.getElementById('root')
)

/**SHITS AND GIGGLES */
/*************
 *
 *
 *
 *
 * ** */

// let showing, t = false;
// document.querySelector('#root').onmousemove = function (event) {
//     if (!showing) {
//         //make show
//         setTimeout(function () {
//             document.querySelector('nav').classList.add('show')
//             showing = true
//         }, 0)

//     } else {
//         //do nothing
//         clearTimeout(t)
//         t = setTimeout(function () {
//             document.querySelector('nav').classList.remove('show')
//             showing = false
//         }, 500)

//     }
// }
