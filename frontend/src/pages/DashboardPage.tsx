import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Map, Plus, Calendar, Users, Eye, Download, MoreVertical, Key, Crown, LogOut, Settings, Zap, CheckCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'
interface JourneyMap {
  id: string
  title: string
  industry?: string
  createdAt: Date | string
  status: 'completed' | 'processing' | 'failed' | string
  personas?: number
  phases?: number
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, userProfile, token, signOut, refreshProfile } = useAuth()
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
            // Transform data to match interface
            const transformedJourneys = data.usage.recent_journeys.map((journey: any) => ({
              id: journey.id,
              title: journey.title,
              industry: journey.industry || 'Unknown',
              createdAt: new Date(journey.created_at),
              status: journey.status as 'completed' | 'processing' | 'failed',
              personas: 2, // Default values since we don't store these yet
              phases: 5
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

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p className="text-xl text-gray-600">Manage your AI-powered customer journey maps</p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/settings')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Journey
            </motion.button>
          </div>
        </div>

        {/* Plan Status & Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Usage Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  title="Journeys Created"
                  value={`${userProfile?.journey_count || 0}/${userProfile?.plan_type === 'starter' ? '5' : '∞'}`}
                  icon={<Map className="w-6 h-6 text-blue-600" />}
                  trend={userProfile?.plan_type === 'starter' ? `${5 - (userProfile?.journey_count || 0)} remaining` : 'Unlimited'}
                />
                <StatsCard
                  title="Current Plan"
                  value={userProfile?.plan_type === 'free' ? 'Free' : 'Pro'}
                  icon={userProfile?.plan_type === 'free' ? <Users className="w-6 h-6 text-green-600" /> : <Crown className="w-6 h-6 text-purple-600" />}
                  trend={userProfile?.plan_type === 'free' ? 'Free plan' : 'Unlimited'}
                />
                <StatsCard
                  title="API Key"
                  value={userProfile?.openai_api_key ? 'Connected' : 'Platform'}
                  icon={<Key className="w-6 h-6 text-orange-600" />}
                  trend={userProfile?.openai_api_key ? 'Your key' : 'Using platform key'}
                />
              </div>
              
              {/* Progress Bar */}
              {userProfile?.plan_type === 'free' && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Journey Usage</span>
                    <span>{userProfile.journey_count}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((userProfile.journey_count || 0) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Plan Actions */}
          <div className="space-y-4">
            {userProfile?.plan_type === 'free' && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center mb-3">
                  <Crown className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Upgrade to Pro</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Get unlimited journey maps with your own OpenAI API key
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/upgrade')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Upgrade Now - $15/month
                </motion.button>
              </div>
            )}
            
            {!userProfile?.openai_api_key && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center mb-3">
                  <Key className="w-6 h-6 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">OpenAI API Key</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {userProfile?.plan_type === 'free' 
                    ? 'Currently using platform API key'
                    : 'Connect your OpenAI API key for unlimited usage'
                  }
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/settings')}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  {userProfile?.plan_type === 'free' ? 'View Settings' : 'Connect API Key'}
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Maps"
            value={journeyMaps.length.toString()}
            icon={<Map className="w-6 h-6 text-blue-600" />}
            trend="All time"
          />
          <StatsCard
            title="Completed"
            value={journeyMaps.filter(j => j.status === 'completed').length.toString()}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            trend="Ready to view"
          />
          <StatsCard
            title="Processing"
            value={journeyMaps.filter(j => j.status === 'processing').length.toString()}
            icon={<Calendar className="w-6 h-6 text-yellow-600" />}
            trend="In progress"
          />
        </div>

        {/* Journey Maps Grid */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Journey Maps</h2>
              <span className="text-sm text-gray-500">{journeyMaps.length} total</span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {journeyMaps.map((map) => (
              <JourneyMapCard key={map.id} map={map} onView={() => navigate(`/journey/${map.id}`)} />
            ))}
          </div>
        </div>

        {/* Empty State (if no maps) */}
        {journeyMaps.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to create your first journey map?</h3>
            <p className="text-gray-600 mb-6">
              {userProfile?.plan_type === 'free' 
                ? `You have ${5 - (userProfile.journey_count || 0)} free journeys remaining`
                : 'Start mapping your customer experience today'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Create Your First Map
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-xl">
          {icon}
        </div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{trend}</p>
    </motion.div>
  )
}

function JourneyMapCard({ map, onView }: { map: JourneyMap, onView: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Safely handle optional properties
  const personas = map.personas ?? 0;
  const phases = map.phases ?? 0;
  const industry = map.industry ?? 'General';

  return (
    <motion.div
      whileHover={{ backgroundColor: '#f9fafb' }}
      className="p-6 cursor-pointer transition-colors"
      onClick={onView}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{map.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(map.status)}`}>
              {map.status}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(map.createdAt), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {personas} {personas === 1 ? 'persona' : 'personas'}
            </span>
            <span className="flex items-center gap-1">
              <Map className="w-4 h-4" />
              {phases} {phases === 1 ? 'phase' : 'phases'}
            </span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {industry}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
          >
            <Download className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}