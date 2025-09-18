import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Map, Plus, Calendar, Users, Key, Crown, Zap, CheckCircle,
  Clock, TrendingUp, Target, BarChart3, Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { JourneyCard } from '../components/ui/JourneyCard'
import { PrimaryButton } from '../components/ui/PrimaryButton'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface JourneyMap {
  id: string
  title: string
  industry?: string
  createdAt: Date | string
  status: 'completed' | 'processing' | 'failed' | 'queued' | 'running'
  personas?: number
  phases?: number
  progress?: number
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, userProfile, token } = useAuth()
  const [journeyMaps, setJourneyMaps] = useState<JourneyMap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserJourneys = async () => {
      if (!user || !token) return

      try {
        const response = await fetch(`${API_BASE_URL}/auth/usage`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.error('Error fetching journeys:', response.statusText)
        } else {
          const data = await response.json()

          if (data.usage && data.usage.recent_journeys) {
            const transformedJourneys = data.usage.recent_journeys.map((journey: any) => ({
              id: journey.id,
              title: journey.title,
              industry: journey.industry || 'Unknown',
              createdAt: new Date(journey.created_at),
              status: journey.status as 'completed' | 'processing' | 'failed' | 'queued' | 'running',
              personas: 2,
              phases: 5,
              progress: journey.status === 'processing' ? Math.floor(Math.random() * 80) + 20 : undefined
            }))
            setJourneyMaps(transformedJourneys)
          }
        }
      } catch (error) {
        console.error('Error fetching journeys:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserJourneys()
  }, [user, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const completedJourneys = journeyMaps.filter(j => j.status === 'completed').length
  const processingJourneys = journeyMaps.filter(j => j.status === 'processing' || j.status === 'running').length
  const totalJourneys = journeyMaps.length

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 border border-primary-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}! 🚀
            </h1>
            <p className="text-lg text-gray-600">
              Ready to map your next customer journey?
            </p>
          </div>
          <PrimaryButton
            onClick={() => navigate('/create')}
            size="lg"
            className="hidden md:flex"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Journey
          </PrimaryButton>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-soft transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalJourneys}</h3>
          <p className="text-sm text-gray-600">Total Journeys</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-soft transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">
              {Math.round((completedJourneys / totalJourneys) * 100) || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{completedJourneys}</h3>
          <p className="text-sm text-gray-600">Completed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-soft transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600 animate-pulse">
              Live
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{processingJourneys}</h3>
          <p className="text-sm text-gray-600">Processing</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-soft transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent-100 rounded-xl">
              <Target className="w-6 h-6 text-accent-600" />
            </div>
            <span className="text-sm font-medium text-accent-600">
              {userProfile?.plan_type === 'free' ? 'Free' : 'Pro'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {userProfile?.journey_count || 0}
            {userProfile?.plan_type === 'free' ? '/5' : '+'}
          </h3>
          <p className="text-sm text-gray-600">This Month</p>
        </motion.div>
      </div>

      {/* Usage Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {journeyMaps.slice(0, 5).map((journey, index) => (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/journey/${journey.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      journey.status === 'completed' ? 'bg-green-100' :
                      journey.status === 'processing' ? 'bg-blue-100' :
                      journey.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {journey.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                       journey.status === 'processing' ? <Clock className="w-5 h-5 text-blue-600" /> :
                       journey.status === 'failed' ? <CheckCircle className="w-5 h-5 text-red-600" /> :
                       <Clock className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{journey.title}</h4>
                      <p className="text-sm text-gray-600">{format(new Date(journey.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      journey.status === 'completed' ? 'bg-green-100 text-green-700' :
                      journey.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      journey.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {journey.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan & Actions */}
        <div className="space-y-6">
          {userProfile?.plan_type === 'free' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center mb-4">
                <Crown className="w-6 h-6 mr-2" />
                <h3 className="font-semibold">Upgrade to Pro</h3>
              </div>
              <p className="text-sm text-primary-100 mb-4">
                Unlimited journeys with your own API key
              </p>
              <PrimaryButton
                variant="secondary"
                onClick={() => navigate('/upgrade')}
                className="w-full bg-white text-primary-600 hover:bg-gray-100"
              >
                Upgrade Now
              </PrimaryButton>
            </motion.div>
          )}

          {/* Usage Progress */}
          {userProfile?.plan_type === 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Journeys this month</span>
                    <span className="font-medium text-gray-900">
                      {userProfile.journey_count}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((userProfile.journey_count || 0) / 5) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {5 - (userProfile.journey_count || 0)} journeys remaining
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Recent Journeys Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Journey Maps</h2>
          <PrimaryButton
            onClick={() => navigate('/journeys')}
            variant="secondary"
            size="sm"
          >
            View All
          </PrimaryButton>
        </div>

        {journeyMaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeyMaps.map((journey, index) => (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <JourneyCard
                  journey={journey}
                  onView={(id) => navigate(`/journey/${id}`)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-12 text-center"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No journeys yet</h3>
            <p className="text-gray-600 mb-6">Create your first customer journey map</p>
            <PrimaryButton onClick={() => navigate('/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Journey
            </PrimaryButton>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}