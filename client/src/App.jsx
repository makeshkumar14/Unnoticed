import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Children from './pages/Children'
import ChildProfile from './pages/ChildProfile'
import HealthRecords from './pages/HealthRecords'
import Reminders from './pages/Reminders'
import CarePlans from './pages/CarePlans'
import AIAssistant from './pages/AIAssistant'

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/children" element={<Children />} />
            <Route path="/children/:id" element={<ChildProfile />} />
            <Route path="/health" element={<HealthRecords />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/care-plans" element={<CarePlans />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
