import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Header } from './components/Header'
import { DashboardLayout } from './components/DashboardLayout'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import JourneysPage from './pages/JourneysPage'
import JourneyMapPage from './pages/JourneyMapPage'
import JourneyDetailPage from './pages/JourneyDetailPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import ReportsPage from './pages/ReportsPage'
import UpgradePage from './pages/UpgradePage'
import TemplatesPage from './pages/TemplatesPage'
import CreateJourneyPage from './pages/CreateJourneyPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import PaymentCallbackPage from './pages/PaymentCallbackPage'
import './App.css'

// Create React Query client with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes (garbage collection time)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: 1, // Retry failed requests once
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify" element={<EmailVerificationPage />} />
            <Route path="/payment/callback" element={
              <ProtectedRoute>
                <PaymentCallbackPage />
              </ProtectedRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ReportsPage />
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
            <Route path="/account" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UpgradePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/templates" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TemplatesPage />
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
    </QueryClientProvider>
  )
}

export default App