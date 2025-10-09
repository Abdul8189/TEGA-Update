import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import '../globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
