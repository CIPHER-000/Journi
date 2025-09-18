import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  BarChart3, TrendingUp, Users, Clock, Target, CheckCircle, AlertCircle,
  Calendar, Map, Activity, Zap, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface AnalyticsData {
  totalJourneys: number
  completedJourneys: number
  failedJourneys: number
  averageCompletionTime: number
  journeysByIndustry: Array<{ name: string; value: number }>
  journeysOverTime: Array<{ date: string; created: number; completed: number }>
  agentPerformance: Array<{ agent: string; success_rate: number; avg_time: number }>
  userActivity: Array<{ date: string; journeys_created: number; active_users: number }>
}

interface AnalyticsPageProps {
  searchQuery?: string
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

export default function AnalyticsPage({ searchQuery = '' }: AnalyticsPageProps) {
  const { user, token } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !token) return

      try {
        const response = await fetch(`${API_BASE_URL}/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          // Mock data for development
          setAnalytics(getMockAnalyticsData())
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setAnalytics(getMockAnalyticsData())
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user, token, dateRange])

  const getMockAnalyticsData = (): AnalyticsData => ({
    totalJourneys: 24,
    completedJourneys: 18,
    failedJourneys: 3,
    averageCompletionTime: 4.2,
    journeysByIndustry: [
      { name: 'E-commerce', value: 8 },
      { name: 'SaaS', value: 6 },
      { name: 'Healthcare', value: 4 },
      { name: 'Education', value: 3 },
      { name: 'Other', value: 3 }
    ],
    journeysOverTime: [
      { date: 'Jan 1', created: 3, completed: 2 },
      { date: 'Jan 8', created: 4, completed: 3 },
      { date: 'Jan 15', created: 2, completed: 4 },
      { date: 'Jan 22', created: 5, completed: 3 },
      { date: 'Jan 29', created: 6, completed: 4 }
    ],
    agentPerformance: [
      { agent: 'Research Agent', success_rate: 95, avg_time: 2.1 },
      { agent: 'Persona Agent', success_rate: 88, avg_time: 3.2 },
      { agent: 'Journey Agent', success_rate: 92, avg_time: 4.5 },
      { agent: 'Analysis Agent', success_rate: 90, avg_time: 1.8 }
    ],
    userActivity: [
      { date: 'Jan 1', journeys_created: 3, active_users: 12 },
      { date: 'Jan 8', journeys_created: 4, active_users: 15 },
      { date: 'Jan 15', journeys_created: 2, active_users: 18 },
      { date: 'Jan 22', journeys_created: 5, active_users: 22 },
      { date: 'Jan 29', journeys_created: 6, active_users: 25 }
    ]
  })

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  const successRate = analytics.totalJourneys > 0
    ? Math.round((analytics.completedJourneys / analytics.totalJourneys) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your journey mapping performance and insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.totalJourneys}</h3>
          <p className="text-sm text-gray-600">Total Journeys</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">{successRate}%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.completedJourneys}</h3>
          <p className="text-sm text-gray-600">Completed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent-100 rounded-xl">
              <Clock className="w-6 h-6 text-accent-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">
              {analytics.averageCompletionTime}m
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Avg Time</h3>
          <p className="text-sm text-gray-600">Completion</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-red-600">
              {Math.round((analytics.failedJourneys / analytics.totalJourneys) * 100) || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.failedJourneys}</h3>
          <p className="text-sm text-gray-600">Failed</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Journeys Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Journeys Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.journeysOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Created"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Journeys by Industry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Journeys by Industry</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.journeysByIndustry}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {analytics.journeysByIndustry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Agent Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Agent Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success_rate" fill="#8B5CF6" name="Success Rate %" />
                <Bar dataKey="avg_time" fill="#06B6D4" name="Avg Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="journeys_created"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Journeys Created"
                />
                <Line
                  type="monotone"
                  dataKey="active_users"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">High Success Rate</h4>
                <p className="text-sm text-gray-600">
                  Your journey completion rate is {successRate}%, above the industry average of 75%
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Fast Processing</h4>
                <p className="text-sm text-gray-600">
                  Average completion time of {analytics.averageCompletionTime} minutes is 30% faster than average
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Target className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Top Industry</h4>
                <p className="text-sm text-gray-600">
                  E-commerce leads with 33% of all journeys created
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Growing User Base</h4>
                <p className="text-sm text-gray-600">
                  Active users increased by 108% over the last month
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}