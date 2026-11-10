import React from 'react'
import ReactDOM from 'react-dom/client'
import { extend } from '@react-three/fiber'
import { RoundedBoxGeometry } from 'three-stdlib'
import App from './App'
import './index.css'

// Extend R3F's catalog so <roundedBoxGeometry> is available as a JSX element.
// Must run before any component that uses it is rendered.
extend({ RoundedBoxGeometry })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
