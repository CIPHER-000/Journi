import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, Calendar, Users, Eye, Download, MoreVertical, Search, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

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
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [journeyMaps, setJourneyMaps] = useState<JourneyMap[]>([])
  const [filtered, setFiltered] = useState<JourneyMap[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

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
              phases: 5
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
    if (!q) {
      setFiltered(journeyMaps)
    } else {
      setFiltered(
        journeyMaps.filter(j => j.title?.toLowerCase().includes(q))
      )
    }
  }, [query, searchQuery, journeyMaps])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Journeys</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search journeys by title..."
            className="pl-10 pr-4 py-2 w-72 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Journey Maps</h2>
            <span className="text-sm text-gray-500">{filtered.length} total</span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filtered.map((map) => (
            <JourneyRow key={map.id} map={map} onView={() => navigate(`/journey/${map.id}`)} />
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">No journeys match your search.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function JourneyRow({ map, onView }: { map: JourneyMap, onView: () => void }) {
  const [isHovered, setIsHovered] = React.useState(false)

  // Log when processing journey is clicked
  const handleViewClick = () => {
    console.log('👆 Journey clicked:', map.title, 'status:', map.status, 'id:', map.id);
    onView();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'queued':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const personas = map.personas ?? 0
  const phases = map.phases ?? 0
  const industry = map.industry ?? 'General'

  return (
    <div
      className={`p-6 cursor-pointer transition-colors ${isHovered ? 'bg-gray-50' : 'bg-white'}`}
      onClick={handleViewClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Implement download functionality
            }}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
          >
            <Download className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Implement more options menu
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

