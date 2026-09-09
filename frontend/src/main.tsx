import React from 'react'
import ReactDom from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

ReactDom.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
