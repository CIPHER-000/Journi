import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  email: string
  plan_type: string
  journey_count: number
  email_verified: boolean
  journey_limit: number
  created_at: string
  updated_at: string
  last_login?: string
  openai_api_key?: string | null
}

interface AuthResponse {
  access_token?: string
  token_type?: string
  expires_in?: number
  user?: UserProfile
  message?: string
  requires_verification?: boolean
}
interface AuthContextType {
  user: UserProfile | null
  userProfile: UserProfile | null
  token: string | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ data: any, error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async () => {
    const storedToken = localStorage.getItem('auth_token')
    if (!storedToken) return null
    
    try {
      // Get user from Supabase session instead of backend API
      const { data: { user }, error } = await supabase.auth.getUser(storedToken)
      
      if (error || !user) {
        localStorage.removeItem('auth_token')
        setToken(null)
        setUser(null)
        setUserProfile(null)
        return null
      }
      
      // Create user profile from Supabase user data
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email!,
        plan_type: 'free',
        journey_count: 0,
        email_verified: !!user.email_confirmed_at,
        journey_limit: 2,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
        last_login: new Date().toISOString(),
        openai_api_key: null
      }
      
      return userProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
      setUserProfile(null)
      return null
    }
  }

  const refreshProfile = async () => {
    // Get current session from Supabase
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const userProfile: UserProfile = {
        id: session.user.id,
        email: session.user.email!,
        plan_type: 'free',
        journey_count: 0,
        email_verified: !!session.user.email_confirmed_at,
        journey_limit: 2,
        created_at: session.user.created_at,
        updated_at: session.user.updated_at || session.user.created_at,
        last_login: new Date().toISOString(),
        openai_api_key: null
      }
      
      setUserProfile(userProfile)
      setUser(userProfile)
      setToken(session.access_token)
    }
  }

  useEffect(() => {
    // Check for stored token, Supabase session, and validate
    const initializeAuth = async () => {
      // First check if we have a Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.access_token) {
        // Use Supabase session token
        localStorage.setItem('auth_token', session.access_token)
        setToken(session.access_token)
        
        // Create profile directly from session data
        const userProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email!,
          plan_type: 'free',
          journey_count: 0,
          email_verified: !!session.user.email_confirmed_at,
          journey_limit: 2,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at,
          last_login: new Date().toISOString(),
          openai_api_key: null
        }
        
        setUserProfile(userProfile)
        setUser(userProfile)
      } else {
        // Fallback to stored token
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedToken) {
        setToken(storedToken)
        const profile = await fetchUserProfile()
        
        setUserProfile(profile)
        setUser(profile)
      } else {
        setToken(null)
        setUser(null)
        setUserProfile(null)
      }
      }
      
      setLoading(false)
    }

    initializeAuth()
    
    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth state change:', event, session)
      
      if (event === 'SIGNED_IN' && session?.access_token) {
        localStorage.setItem('auth_token', session.access_token)
        setToken(session.access_token)
        
        // Create profile directly from session data
        const userProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email!,
          plan_type: 'free',
          journey_count: 0,
          email_verified: !!session.user.email_confirmed_at,
          journey_limit: 2,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at,
          last_login: new Date().toISOString(),
          openai_api_key: null
        }
        
        setUserProfile(userProfile)
        setUser(userProfile)
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('auth_token')
        setToken(null)
        setUser(null)
        setUserProfile(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Starting signup process for:', email)
      
      // Use Supabase Auth directly for signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        console.error('Supabase signup error:', error)
        return { data: null, error: { message: error.message } }
      }
      
      console.log('Signup successful:', data)
      
      // If user is created but not confirmed, show verification message
      if (data.user && !data.user.email_confirmed_at) {
        return { 
          data: { 
            requires_verification: true,
            user: data.user 
          }, 
          error: null 
        }
      }
      
      // If user is immediately confirmed (shouldn't happen with email confirmation enabled)
      if (data.user && data.user.email_confirmed_at && data.session) {
        localStorage.setItem('auth_token', data.session.access_token)
        setToken(data.session.access_token)
        
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email!,
          plan_type: 'free',
          journey_count: 0,
          email_verified: true,
          journey_limit: 2,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at,
          last_login: new Date().toISOString(),
          openai_api_key: null
        }
        
        setUser(userProfile)
        setUserProfile(userProfile)
      }
      
      return { data, error: null }
      
    } catch (err) {
      console.error('Signup error:', err)
      return { data: null, error: { message: 'Network error occurred' } }
    }
  }


  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email)
      
      // Use Supabase Auth directly for signin
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Supabase signin error:', error)
        return { error: { message: error.message } }
      }
      
      if (!data.user?.email_confirmed_at) {
        return { error: { message: 'Please verify your email before signing in' } }
      }
      
      // Store token and fetch user profile
      localStorage.setItem('auth_token', data.session.access_token)
      setToken(data.session.access_token)
      
      // Create user profile directly from Supabase data
      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email!,
        plan_type: 'free',
        journey_count: 0,
        email_verified: true,
        journey_limit: 2,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
        last_login: new Date().toISOString(),
        openai_api_key: null
      }
      
      setUser(userProfile)
      setUserProfile(userProfile)
      
      console.log('Sign in successful')
      return { error: null }
      
    } catch (err) {
      console.error('Signin error:', err)
      return { error: { message: 'Network error occurred' } }
    }
  }

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear local storage and state
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
      setUserProfile(null)
      
      console.log('Sign out successful')
    } catch (err) {
      console.error('Signout error:', err)
    }
  }

  const value = {
    user,
    userProfile,
    token,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}