import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { SpeedInsights } from "@vercel/speed-insights/react"
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <SpeedInsights />
    </BrowserRouter>
  </React.StrictMode>,
)
