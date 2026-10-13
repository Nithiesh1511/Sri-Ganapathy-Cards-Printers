import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Scroll-reveal styles only apply once this class is set, so a visitor whose
// script never runs still sees the whole page.
document.documentElement.classList.add('js')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
