import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import Main from './components/Main/Main.jsx'
const App = () => {
  return (
    <ThemeProvider>
      <Sidebar/>
      <Main/>
    </ThemeProvider>
  )
}

export default App