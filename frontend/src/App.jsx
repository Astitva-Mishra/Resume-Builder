import React from 'react'
import { Routes,Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import { User } from 'lucide-react'
import UserProvider from './context/UserContext'

const App = () => {
  return (
    <UserProvider>
      <Routes> 
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </UserProvider>
  )
}

export default App