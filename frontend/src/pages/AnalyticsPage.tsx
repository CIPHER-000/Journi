import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  ComposedChart, Scatter, ScatterChart
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns'
import {
  TrendingUp, TrendingDown, Activity, Clock, Target, Zap, Users,
  BarChart3, PieChart as PieChartIcon, Calendar, Filter, Download,
  RefreshCw, Award, AlertTriangle, CheckCircle, Timer, Building,
  Lightbulb, Star, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface UserMetrics {
  totalJourneys: number
  completedJourneys: number
  failedJourneys: number
  inProgressJourneys: number
  averageCompletionTime: number
  successRate: number
  totalProcessingTime: number
  favoriteIndustry: string
  accountAgeDays: number
  lastActivity: string
}

interface AnalyticsData {
  userMetrics: UserMetrics
  journeysByIndustry: Array<{ name: string; value: number; isFavorite?: boolean }>
  journeysOverTime: Array<{ date: string; created: number; completed: number; failed: number }>
  agentPerformance: Array<{ agent: string; success_rate: number; avg_time: number }>
  usagePatterns: {
    peakUsageHours: number[]
    averageJourneysPerWeek: number
    mostProductiveDay: string
    usageGrowth: number
  }
  journeyComplexity: Array<{ complexity: string; count: number; avg_time: number }>
}

interface AnalyticsPageProps {
  searchQuery?: string
}

const COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE']

const formatMetric = (value: number, suffix: string = ''): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${suffix}`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K${suffix}`
  return `${value}${suffix}`
}

const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`
}

const MetricCard: React.FC<{
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  suffix?: string
}> = ({ title, value, change, icon, color, suffix = '' }) => {
  const getChangeIcon = () => {
    if (change === undefined) return null
    if (change > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />
    if (change < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getChangeColor = () => {
    if (change === undefined) return 'text-gray-600'
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? formatMetric(value, suffix) : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 mt-2 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="text-sm font-medium">
                {Math.abs(change)}% from last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage({ searchQuery = '' }: AnalyticsPageProps) {
  const { user, token } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !token) return

      try {
        const response = await fetch(`${API_BASE_URL}/analytics?date_range=${dateRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setAnalytics(data.data)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    fetchAnalytics()
  }, [user, token, dateRange])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate refresh
    const response = await fetch(`${API_BASE_URL}/analytics?date_range=${dateRange}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      const data = await response.json()
      setAnalytics(data.data)
    }
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Analytics data not available</p>
        </div>
      </div>
    )
  }

  const { userMetrics, journeysOverTime, journeysByIndustry, agentPerformance, usagePatterns, journeyComplexity } = analytics

  // Calculate insights
  const efficiency = userMetrics.totalProcessingTime > 0 ?
    Math.round((userMetrics.completedJourneys / userMetrics.totalProcessingTime) * 100) / 100 : 0

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Personalized insights for {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Key User Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Journeys"
            value={userMetrics.totalJourneys}
            change={usagePatterns.usageGrowth}
            icon={<BarChart3 className="w-6 h-6 text-white" />}
            color="bg-indigo-600"
          />
          <MetricCard
            title="Success Rate"
            value={userMetrics.successRate}
            suffix="%"
            icon={<Target className="w-6 h-6 text-white" />}
            color="bg-green-600"
          />
          <MetricCard
            title="Avg. Completion Time"
            value={userMetrics.averageCompletionTime}
            suffix="m"
            icon={<Clock className="w-6 h-6 text-white" />}
            color="bg-blue-600"
          />
          <MetricCard
            title="Efficiency Score"
            value={efficiency}
            suffix="x"
            icon={<Zap className="w-6 h-6 text-white" />}
            color="bg-purple-600"
          />
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Completed</p>
                <p className="text-2xl font-bold text-green-700">{userMetrics.completedJourneys}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Timer className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">In Progress</p>
                <p className="text-2xl font-bold text-blue-700">{userMetrics.inProgressJourneys}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Failed</p>
                <p className="text-2xl font-bold text-red-700">{userMetrics.failedJourneys}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Journey Creation Over Time */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Journey Activity Over Time
            </h3>
            <LineChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={journeysOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="created"
                  stackId="1"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.2}
                  name="Created"
                />
                <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              Journey Distribution by Industry
            </h3>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={journeysByIndustry}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, isFavorite }) => (
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      fill="#374151"
                      fontSize={12}
                      fontWeight={isFavorite ? 600 : 400}
                    >
                      {name}: {value}
                    </text>
                  )}
                >
                  {journeysByIndustry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} journeys`,
                    props.payload.isFavorite ? `${name} (Favorite)` : name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              AI Agent Performance
            </h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="agent" type="category" width={100} stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="success_rate" fill="#10B981" name="Success Rate %" radius={[0, 4, 4, 0]} />
                <Bar dataKey="avg_time" fill="#6366F1" name="Avg Time (min)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Journey Complexity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Journey Complexity Analysis
            </h3>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {journeyComplexity.map((complexity, index) => (
              <div key={complexity.complexity} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    complexity.complexity === 'Simple' ? 'bg-green-500' :
                    complexity.complexity === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium text-gray-900">{complexity.complexity}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{complexity.count} journeys</p>
                  <p className="text-sm text-gray-600">{formatTime(complexity.avg_time)} avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Personalized Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Top Performer</h4>
                <p className="text-sm text-gray-600">
                  Your success rate of {userMetrics.successRate}% exceeds the average by 15%
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-indigo-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Industry Focus</h4>
                <p className="text-sm text-gray-600">
                  {userMetrics.favoriteIndustry} is your most successful category
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Productivity Peak</h4>
                <p className="text-sm text-gray-600">
                  {usagePatterns.mostProductiveDay}s are your most productive days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}