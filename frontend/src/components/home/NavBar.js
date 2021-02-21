import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function NavBar(props) {
  let [showing, setShowing] = useState(false)
  let [t, setT] = useState(false)

  window.onmousemove = (e) => {
    if (!showing) {
      //make show
      setTimeout(function () {
        setShowing(true)
      }, 0)
    } else {
      //do nothing
      clearTimeout(t)
      t = setTimeout(function () {
        setShowing(false)
      }, 1500)
      setT(t)
    }
  }

  return (
    <div>
      <nav className={showing ? 'show' : ''}>
        <Link to="/">🏠</Link>
        <Link to="/profile">😎</Link>
        <Link to="/dashboard">💰</Link>
      </nav>
      <span style={{ display: showing ? 'none' : 'flex' }}>
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          class="svg-inline--fa fa-chevron-down fa-w-14 fa-2x"
        >
          <path
            fill="currentColor"
            d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"
            class=""
          ></path>
        </svg>
      </span>
    </div>
  )
}
