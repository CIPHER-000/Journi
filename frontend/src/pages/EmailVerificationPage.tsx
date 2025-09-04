import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Map, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client directly in this file to avoid import issues
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)

export default function EmailVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Parse URL parameters (both hash and query string)
        const urlParams = new URLSearchParams(location.search)
        const hashParams = new URLSearchParams(location.hash.substring(1))
        
        // Try both query params and hash params
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token')
        const type = urlParams.get('type') || hashParams.get('type')
        const tokenHash = urlParams.get('token_hash') || hashParams.get('token_hash')
        
        console.log('Verification params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          hasTokenHash: !!tokenHash,
          type,
          fullHash: location.hash,
          fullSearch: location.search
        })
        
        // Handle token_hash verification (newer Supabase format)
        if (tokenHash && type === 'signup') {
          console.log('Using token_hash verification method')
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'signup'
          })
          
          if (error) {
            console.error('Token hash verification failed:', error)
            setStatus('error')
            setMessage(error.message || 'Email verification failed.')
            return
          }
          
          console.log('Token hash verification successful:', data)
          setStatus('success')
          setMessage('Your email has been verified successfully! Redirecting to dashboard...')
          
          // Store the session
          if (data.session) {
            localStorage.setItem('auth_token', data.session.access_token)
          }
          
          // Redirect after delay
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
          
          return
        }
        
        // Handle access_token verification (older format)
        if (accessToken && refreshToken && type === 'signup') {
          console.log('Missing required verification parameters')
          console.log('Using access_token verification method')
          
          // Set the session in Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Session setup failed:', error)
            setStatus('error')
            setMessage(error.message || 'Email verification failed. The verification link may be expired or invalid.')
            return
          }
          
          console.log('Session set successfully, user:', data.user)
          setStatus('success')
          setMessage('Your email has been verified successfully! Redirecting to dashboard...')
          
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname)
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
          
          return
        }
        
        // If no valid verification parameters found
        console.log('No valid verification parameters found')
        setStatus('error')
        setMessage('Invalid verification link. Please try signing up again.')
        
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred during verification.')
      }
    }

    handleEmailVerification()
  }, [location.hash, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Map className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
              Journi
            </span>
          </div>

          {/* Status Content */}
          {status === 'loading' && (
            <div>
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  🎉 Your account is now active. Redirecting you to your dashboard...
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                <span className="text-blue-600">Redirecting...</span>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  If you continue to have issues, please try signing up again or contact our support team.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Sign Up Again
                </motion.button>
                <Link to="/login">
                  <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 transition-colors"
                >
                  Back to Login
                </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}