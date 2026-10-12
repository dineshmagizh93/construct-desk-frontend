import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { API_URL, apiUrlProblem } from './lib/apiUrl'

const root = document.getElementById('root')!
const problem = apiUrlProblem(API_URL, window.location.hostname)

if (problem) {
  // A deployment built without its API address would only show unexplained failures; say what is wrong instead.
  root.innerHTML = '<div style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1.5rem"><h1 style="font-size:1.25rem">This site is not set up yet</h1><p style="color:#555;line-height:1.5"></p></div>'
  root.querySelector('p')!.textContent = problem
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
