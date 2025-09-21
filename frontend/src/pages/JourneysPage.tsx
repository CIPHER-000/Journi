import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Plus, Search, Filter, Grid, List, Calendar, Users, Map, Loader2,
  Eye, Edit, Download, Trash2, MoreVertical, Star, Clock, CheckCircle, AlertCircle, Zap
} from "lucide-react";
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

interface JourneyMap {
  id: string
  title: string
  industry?: string
  createdAt: Date | string
  status: 'completed' | 'processing' | 'failed' | 'queued' | 'draft' | string
  personas?: string[]
  phases?: string[]
  lastModified?: Date | string
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

interface JourneysPageProps {
  searchQuery?: string
}

export default function JourneysPage({ searchQuery = '' }: JourneysPageProps) {
  const { user, token, userProfile } = useAuth()
  const navigate = useNavigate()
  const [journeyMaps, setJourneyMaps] = useState<JourneyMap[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Fetch journeys from API
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
          setLoading(false)
          return
        }

        const data = await response.json()

        if (data.usage && data.usage.recent_journeys) {
          const transformedJourneys = data.usage.recent_journeys.map((journey: any) => ({
            id: journey.id,
            title: journey.title,
            industry: journey.industry || 'Unknown',
            createdAt: new Date(journey.created_at),
            status: journey.status || 'draft',
            personas: journey.personas || [],
            phases: journey.phases || [],
            lastModified: journey.updated_at ? new Date(journey.updated_at) : new Date(journey.created_at)
          }))
          setJourneyMaps(transformedJourneys)
        }
      } catch (error) {
        console.error('Error fetching journeys:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserJourneys()
  }, [user, token])

  // Calculate usage data
  const userPlan = userProfile?.plan_type || 'free'
  const usageData = {
    used: userProfile?.journey_count || 0,
    total: userProfile?.plan_type === 'free' ? 5 : 25,
    resetDate: userProfile?.plan_type === 'free' ? null : format(new Date(), 'MMM d, yyyy')
  }

  // Filter journeys based on search and filters
  const filteredJourneys = journeyMaps.filter(journey => {
    const matchesSearch = journey.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                         (journey.industry && journey.industry.toLowerCase().includes(localSearchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || journey.status === statusFilter

    // Simple date filtering (can be enhanced)
    const matchesDate = dateFilter === "all" || true // Simplified for now

    return matchesSearch && matchesStatus && matchesDate
  })

  // Handle actions
  const handleCreateJourney = () => navigate('/create')
  const handleViewJourney = (id: string) => {
    // Navigate to journey details
    console.log('View journey:', id)
  }
  const handleEditJourney = (id: string) => {
    // Navigate to edit journey
    console.log('Edit journey:', id)
  }
  const handleExportJourney = (id: string) => {
    // Export journey functionality
    console.log('Export journey:', id)
  }
  const handleDeleteJourney = (id: string) => {
    // Delete journey functionality
    if (confirm('Are you sure you want to delete this journey?')) {
      setJourneyMaps(prev => prev.filter(j => j.id !== id))
    }
  }
  const handleUpgrade = () => navigate('/upgrade')

  // Status colors
  const statusColors = {
    'completed': 'bg-green-100 text-green-700 border-green-200',
    'processing': 'bg-blue-100 text-blue-700 border-blue-200',
    'failed': 'bg-red-100 text-red-700 border-red-200',
    'queued': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'draft': 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const statusIcons = {
    'completed': CheckCircle,
    'processing': Loader2,
    'failed': AlertCircle,
    'queued': Clock,
    'draft': Map
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Loading your journeys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Journeys</h1>
                <p className="text-gray-600">Manage and track all your customer journey maps</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:block text-right">
                <p className="text-sm text-gray-600">Journeys Used</p>
                <p className="text-lg font-medium text-gray-900">{usageData.used}/{usageData.total}</p>
              </div>
              <Button
                onClick={handleCreateJourney}
                className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-medium"
                disabled={usageData.used >= usageData.total}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Journey
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Usage Indicator */}
        <div className="lg:hidden mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Journeys Used</p>
                <p className="text-lg font-medium text-gray-900">{usageData.used}/{usageData.total}</p>
              </div>
              {userPlan === 'free' && usageData.used >= usageData.total * 0.8 && (
                <Button
                  onClick={handleUpgrade}
                  className="bg-green-600 text-white text-sm"
                >
                  Upgrade
                </Button>
              )}
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${(usageData.used / usageData.total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search journeys by title or industry..."
                  className="pl-10 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-gray-300 rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processing">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] border-gray-300 rounded-lg">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className={`rounded-none ${viewMode === "cards" ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={`rounded-none ${viewMode === "table" ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredJourneys.length}</span> of <span className="font-semibold text-gray-900">{journeyMaps.length}</span> journeys
          </p>
          {(localSearchQuery || statusFilter !== "all" || dateFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalSearchQuery('')
                setStatusFilter('all')
                setDateFilter('all')
              }}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Content */}
        {filteredJourneys.length > 0 ? (
          viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJourneys.map((journey) => {
                const StatusIcon = statusIcons[journey.status as keyof typeof statusIcons] || Map
                return (
                  <Card key={journey.id} className="bg-white shadow-medium border-0 hover:shadow-strong transition-all duration-300 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {journey.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                              {journey.industry}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${
                            journey.status === 'completed' ? 'text-green-600' :
                            journey.status === 'processing' ? 'text-blue-600' :
                            journey.status === 'failed' ? 'text-red-600' :
                            journey.status === 'queued' ? 'text-yellow-600' : 'text-gray-600'
                          }`} />
                          <Badge className={`${statusColors[journey.status as keyof typeof statusColors]} border text-xs font-medium`}>
                            {journey.status.replace('-', ' ')}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{journey.personas?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Map className="h-4 w-4" />
                            <span>{journey.phases?.length || 0}</span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="text-xs text-gray-500">
                          Created {format(new Date(journey.createdAt), 'MMM d, yyyy')}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewJourney(journey.id)}
                            className="flex-1 border-gray-300 hover:bg-gray-50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditJourney(journey.id)}
                            className="flex-1 border-gray-300 hover:bg-gray-50"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportJourney(journey.id)}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-medium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journey Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phases</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredJourneys.map((journey) => {
                      const StatusIcon = statusIcons[journey.status as keyof typeof statusIcons] || Map
                      return (
                        <tr key={journey.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{journey.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{journey.industry}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              {journey.personas?.length || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Map className="h-4 w-4" />
                              {journey.phases?.length || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${
                                journey.status === 'completed' ? 'text-green-600' :
                                journey.status === 'processing' ? 'text-blue-600' :
                                journey.status === 'failed' ? 'text-red-600' :
                                journey.status === 'queued' ? 'text-yellow-600' : 'text-gray-600'
                              }`} />
                              <Badge className={`${statusColors[journey.status as keyof typeof statusColors]} border text-xs font-medium`}>
                                {journey.status.replace('-', ' ')}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {format(new Date(journey.createdAt), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewJourney(journey.id)} className="border-gray-300 hover:bg-gray-50">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditJourney(journey.id)} className="border-gray-300 hover:bg-gray-50">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleExportJourney(journey.id)} className="border-gray-300 hover:bg-gray-50">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-medium p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Map className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No journeys found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {localSearchQuery || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters or search terms to find what you're looking for."
                : "Get started by creating your first customer journey map. Our AI will help you map out the perfect customer experience."
              }
            </p>
            {(!localSearchQuery && statusFilter === "all" && dateFilter === "all") && (
              <Button
                onClick={handleCreateJourney}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-strong hover:shadow-xl transition-all"
                disabled={usageData.used >= usageData.total}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Journey
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}