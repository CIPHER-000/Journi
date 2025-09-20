import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Map, Plus, Calendar, Users, Key, Crown, Zap, CheckCircle,
  Clock, TrendingUp, Target, BarChart3, Loader2, FileText, BookOpen
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
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your journey mapping overview.</p>
          </div>

          <PrimaryButton
            onClick={() => navigate('/create')}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-medium gap-3"
          >
            <Plus className="w-5 h-5" />
            Create New Journey
          </PrimaryButton>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-sm border border-gray-200 rounded-xl"
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Map className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Journeys Created</p>
                <p className="text-2xl font-semibold text-gray-900">{totalJourneys}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-sm border border-gray-200 rounded-xl"
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                <p className="text-2xl font-semibold text-gray-900">{completedJourneys}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-sm border border-gray-200 rounded-xl"
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Templates Used</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Plan Usage Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white shadow-sm border border-gray-200 rounded-xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Crown className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Plan Usage</h3>
                <p className="text-sm text-gray-600">{userProfile?.plan_type === 'free' ? 'Free' : 'Pro'} Plan</p>
              </div>
            </div>

            {userProfile?.plan_type === 'free' && (
              <PrimaryButton
                onClick={() => navigate('/upgrade')}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Upgrade
              </PrimaryButton>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {userProfile?.plan_type === 'free' ? 'Journeys Used' : 'Journeys This Month'}
              </span>
              <span className="font-medium text-gray-900">
                {userProfile?.plan_type === 'free'
                  ? `${userProfile?.journey_count || 0}/5 used`
                  : `${userProfile?.journey_count || 0}/25`
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-green-600 to-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((userProfile?.journey_count || 0) / (userProfile?.plan_type === 'free' ? 5 : 25)) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>

            {userProfile?.plan_type === 'free' && (userProfile.journey_count || 0) >= 4 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-3">
                <p className="text-sm text-yellow-800">
                  You're running low on journeys. Upgrade to Pro for 25 journeys per month.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Journeys */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Journeys</h3>
              <PrimaryButton
                onClick={() => navigate('/journeys')}
                variant="secondary"
                size="sm"
                className="text-green-600 hover:text-green-700"
              >
                View All
              </PrimaryButton>
            </div>
          </div>
          <div className="p-6">
            {journeyMaps.length > 0 ? (
              <div className="space-y-3">
                {journeyMaps.slice(0, 3).map((journey, index) => (
                  <motion.div
                    key={journey.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Map className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{journey.title}</h4>
                        <p className="text-xs text-gray-600">{journey.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        journey.status === 'completed' ? 'bg-green-100 text-green-800' :
                        journey.status === 'processing' || journey.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                        journey.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {journey.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(journey.createdAt), 'MMM d')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Map className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">No journeys yet</h4>
                <p className="text-xs text-gray-600 mb-3">Create your first customer journey map</p>
                <PrimaryButton size="sm" onClick={() => navigate('/create')}>
                  <Plus className="w-3 h-3 mr-1" />
                  Create Journey
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <PrimaryButton
                onClick={() => navigate('/analytics')}
                variant="secondary"
                size="sm"
                className="text-green-600 hover:text-green-700"
              >
                View All
              </PrimaryButton>
            </div>
          </div>
          <div className="p-6">
            {completedJourneys > 0 ? (
              <div className="space-y-3">
                {journeyMaps.filter(j => j.status === 'completed').slice(0, 3).map((journey, index) => (
                  <motion.div
                    key={`report-${journey.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{journey.title} Report</h4>
                        <p className="text-xs text-gray-600">Generated insights</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {format(new Date(journey.createdAt), 'MMM d')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">No reports yet</h4>
                <p className="text-xs text-gray-600 mb-3">Complete a journey to generate reports</p>
                <PrimaryButton size="sm" onClick={() => navigate('/create')}>
                  <Plus className="w-3 h-3 mr-1" />
                  Create Journey
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}