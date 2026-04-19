import React, { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import { apiCall, getToken, clearToken, setToken, setUser as saveUser } from './lib/api'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [campaignKey, setCampaignKey] = useState(0)

  // On mount: verify any stored JWT and restore session
  useEffect(() => {
    const verify = async () => {
      const token = getToken()
      if (!token) { setCheckingSession(false); return }
      try {
        const { user } = await apiCall('/api/auth/me')
        setUser(user)
        setCurrentView('dashboard')
      } catch {
        clearToken()
      } finally {
        setCheckingSession(false)
      }
    }
    verify()
  }, [])

  const handleAuthenticated = (userData) => {
    setUser(userData)
    setCurrentView('dashboard')
  }

  const handleLogout = async () => {
    try { await apiCall('/api/auth/logout', { method: 'POST' }) } catch {}
    clearToken()
    setUser(null)
    setCurrentView('landing')
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-black text-lg">P</span>
          </div>
          <div className="w-6 h-6 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {currentView === 'landing' && (
        <LandingPage onLaunch={() => setCurrentView('login')} />
      )}
      {currentView === 'login' && (
        <AuthPage
          onAuthenticated={handleAuthenticated}
          onBack={() => setCurrentView('landing')}
        />
      )}
      {currentView === 'dashboard' && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default App
