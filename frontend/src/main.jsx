import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import store from './store'
import { getToken } from './utils/auth'

const token = getToken()
if (token) {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
