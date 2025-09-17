import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Header } from './components/Header'
import { DashboardLayout } from './components/DashboardLayout'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import CreateJourneyPage from './pages/CreateJourneyPage'
import DashboardPage from './pages/DashboardPage'
import JourneysPage from './pages/JourneysPage'
import JourneyMapPage from './pages/JourneyMapPage'
import JourneyDetailPage from './pages/JourneyDetailPage'
import SettingsPage from './pages/SettingsPage'
import UpgradePage from './pages/UpgradePage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify" element={<EmailVerificationPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateJourneyPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/journey/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <JourneyDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/journeys" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <JourneysPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/upgrade" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UpgradePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App