import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const stored = localStorage.getItem('merchantinfo-theme')
if (stored === 'light' || stored === 'dark') {
  document.documentElement.setAttribute('data-theme', stored)
}

// StrictMode removed to avoid double-mount triggering Vite's error overlay
// (attachShadow on same element twice → NotSupportedError)
createRoot(document.getElementById('root')!).render(<App />)
