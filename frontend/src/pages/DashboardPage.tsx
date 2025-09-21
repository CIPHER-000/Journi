import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Button } from '../components/ui/button'
import { Plus, Map, FileText, BookOpen, Eye, Edit, Crown, TrendingUp, Loader2, Zap, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface JourneyMap {
  id: string
  title: string
  industry?: string
  createdAt: Date | string
  status: 'completed' | 'processing' | 'failed' | 'queued' | 'running'
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
              status: journey.status as 'completed' | 'processing' | 'failed' | 'queued' | 'running'
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

  // Mock data - simplified version back to original
  const metrics = {
    journeysCreated: journeyMaps.length,
    reportsGenerated: journeyMaps.filter(j => j.status === 'completed').length,
    templatesUsed: 5
  }

  // Plan usage data - Change this to test different plans
  const planUsage = {
    used: userProfile?.journey_count || 0,
    total: userProfile?.plan_type === 'free' ? 5 : 25,
    plan: userProfile?.plan_type === 'free' ? 'Free' : 'Pro'
  }

  // For Pro plan, show monthly reset
  const isProPlan = planUsage.plan === 'Pro'
  const proUsage = {
    used: userProfile?.journey_count || 0,
    total: 25,
    resetDate: 'Jan 15, 2025'
  }

  const recentJourneys = journeyMaps.slice(0, 2).map(journey => ({
    id: journey.id,
    title: journey.title,
    status: journey.status === 'completed' ? 'Complete' : journey.status === 'processing' || journey.status === 'running' ? 'In Progress' : journey.status,
    lastUpdated: format(new Date(journey.createdAt), 'MMM d, yyyy')
  }))

  const recentReports = journeyMaps.filter(j => j.status === 'completed').slice(0, 2).map(journey => ({
    id: journey.id,
    title: `${journey.title} Analysis`,
    createdDate: format(new Date(journey.createdAt), 'MMM d, yyyy')
  }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Create Button */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your journey mapping overview.</p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/create')}
            className="bg-green-600 text-white hover:bg-green-700 px-6 py-2.5 text-sm font-medium gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Journey
          </Button>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Journeys Created</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.journeysCreated}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Map className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reports Generated</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.reportsGenerated}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Templates Used</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.templatesUsed}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Usage Card */}
      <Card className="bg-white border border-gray-200 rounded-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Plan Usage</h3>
                <p className="text-sm text-gray-600">{isProPlan ? 'Pro' : 'Free'} Plan</p>
              </div>
            </div>

            {!isProPlan && (
              <Button
                onClick={() => navigate('/upgrade')}
                className="bg-green-600 text-white hover:bg-green-700 px-3 py-1.5 text-sm font-medium"
              >
                Upgrade
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {isProPlan ? 'Journeys This Month' : 'Journeys Used'}
              </span>
              <span className="font-medium text-gray-900">
                {isProPlan ? `${proUsage.used}/${proUsage.total}` : `${planUsage.used}/${planUsage.total}`} used
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${isProPlan ? (proUsage.used / proUsage.total) * 100 : (planUsage.used / planUsage.total) * 100}%`
                }}
              ></div>
            </div>

            {isProPlan && (
              <p className="text-xs text-gray-500">
                Resets on {proUsage.resetDate}
              </p>
            )}

            {!isProPlan && planUsage.used >= planUsage.total * 0.8 && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="text-yellow-800">
                  You're running low on journeys. Upgrade to Pro for 25 journeys per month.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Persona Card */}
      <Card className="bg-white border border-gray-200 rounded-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Active Persona</h3>
                <p className="text-sm text-gray-600">Customer Experience Manager</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
              Change
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Journeys */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Journeys</h2>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
              onClick={() => navigate('/journeys')}
            >
              View All
            </Button>
          </div>

          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                {recentJourneys.map((journey) => (
                  <div key={journey.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">{journey.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          journey.status === 'Complete'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {journey.status}
                        </span>
                        <span className="text-gray-500">{journey.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="border-gray-300 hover:bg-gray-50 p-2">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-300 hover:bg-gray-50 p-2">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
              View All
            </Button>
          </div>

          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.createdDate}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="border-blue-300 hover:bg-blue-50 p-2">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-blue-300 hover:bg-blue-50 p-2">
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}