import React from "react"

import App from "./App"
import { BrowserRouter } from 'react-router-dom'

export default function QApp() {
  return <BrowserRouter>
    <App />
  </BrowserRouter>
}