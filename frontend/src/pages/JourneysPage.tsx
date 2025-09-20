import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, Calendar, Users, Eye, Download, MoreVertical, Search, Loader2, Grid, List, Plus, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { JourneyCard } from '../components/ui/JourneyCard'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { UsageIndicator } from '../components/ui/UsageIndicator'

interface JourneyMap {
  id: string
  title: string
  industry?: string
  createdAt: Date | string
  status: 'completed' | 'processing' | 'failed' | 'queued' | string
  personas?: number
  phases?: number
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface JourneysPageProps {
  searchQuery?: string
}

export default function JourneysPage({ searchQuery = '' }: JourneysPageProps) {
  const { user, token, userProfile } = useAuth()
  const navigate = useNavigate()
  const [journeyMaps, setJourneyMaps] = useState<JourneyMap[]>([])
  const [filtered, setFiltered] = useState<JourneyMap[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [statusFilter, setStatusFilter] = useState('all')

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
        if (response.ok) {
          const data = await response.json()
          if (data.usage && data.usage.recent_journeys) {
            const transformed = data.usage.recent_journeys.map((j: any) => ({
              id: j.id,
              title: j.title,
              industry: j.industry || 'Unknown',
              createdAt: new Date(j.created_at),
              status: j.status as 'completed' | 'processing' | 'failed' | 'queued',
              personas: 2,
              phases: 5,
              progress: j.status === 'processing' ? Math.floor(Math.random() * 80) + 20 : undefined
            }))
            setJourneyMaps(transformed)
            setFiltered(transformed)
          }
        }
      } catch (e) {
        console.error('Error fetching journeys:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchUserJourneys()
  }, [user, token])

  useEffect(() => {
    // Use searchQuery from header if available, otherwise use local query
    const q = (searchQuery || query).trim().toLowerCase()
    let filteredResults = journeyMaps

    if (q) {
      filteredResults = journeyMaps.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.industry?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      filteredResults = filteredResults.filter(j => j.status === statusFilter)
    }

    setFiltered(filteredResults)
  }, [query, searchQuery, journeyMaps, statusFilter])

  const userPlan = userProfile?.plan_type || 'free'
  const usageData = {
    used: userProfile?.journey_count || 0,
    total: userPlan === 'free' ? 5 : 25,
    resetDate: userPlan === 'pro' ? 'Jan 15' : undefined
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Loading your journeys...</p>
        </div>
      </div>
    )
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
    queued: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Journeys</h1>
          <p className="text-gray-600">Manage and track all your customer journey maps</p>
        </div>
        <div className="flex items-center gap-3">
          <UsageIndicator
            plan={userPlan as 'free' | 'pro'}
            used={usageData.used}
            total={usageData.total}
            resetDate={usageData.resetDate}
            onUpgrade={() => navigate('/upgrade')}
            className="hidden lg:block"
          />
          <PrimaryButton
            onClick={() => navigate('/create')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-medium gap-3"
            disabled={usageData.used >= usageData.total}
          >
            <Plus className="w-5 h-5" />
            Create New Journey
          </PrimaryButton>
        </div>
      </div>

      {/* Mobile Usage Indicator */}
      <div className="lg:hidden">
        <UsageIndicator
          plan={userPlan as 'free' | 'pro'}
          used={usageData.used}
          total={usageData.total}
          resetDate={usageData.resetDate}
          onUpgrade={() => navigate('/upgrade')}
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search journeys..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <div className="flex border border-gray-300 rounded-xl">
            <PrimaryButton
              variant={viewMode === 'cards' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className={viewMode === 'cards' ? 'bg-green-600 text-white' : 'bg-white text-gray-900'}
            >
              <Grid className="w-4 h-4" />
            </PrimaryButton>
            <PrimaryButton
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-green-600 text-white' : 'bg-white text-gray-900'}
            >
              <List className="w-4 h-4" />
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((journey, index) => (
            <motion.div
              key={journey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <JourneyCard
                journey={journey}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journey Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phases</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((journey) => (
                  <tr key={journey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{journey.title}</div>
                      <div className="text-sm text-gray-500">{journey.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {journey.personas || 2}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Map className="w-4 h-4" />
                        {journey.phases || 5}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[journey.status as keyof typeof statusColors] || statusColors.draft}`}>
                        {journey.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(journey.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <PrimaryButton
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/journey/${journey.id}`)}
                        >
                          View
                        </PrimaryButton>
                        <PrimaryButton
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            if (journey.status === 'processing' || journey.status === 'queued') {
                              navigate('/create', {
                                state: {
                                  restoreJourney: true,
                                  journeyId: journey.id,
                                  journeyTitle: journey.title
                                }
                              });
                            } else {
                              navigate(`/journey/${journey.id}`);
                            }
                          }}
                        >
                          {journey.status === 'processing' || journey.status === 'queued' ? 'Continue' : 'Edit'}
                        </PrimaryButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No journeys found</h3>
          <p className="text-gray-600 mb-6">
            {query || statusFilter !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Get started by creating your first customer journey map'
            }
          </p>
          {!query && statusFilter === 'all' && (
            <PrimaryButton
              onClick={() => navigate('/create')}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              disabled={usageData.used >= usageData.total}
            >
              <Plus className="w-4 h-4" />
              Create Your First Journey
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  )
}


