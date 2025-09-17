import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, Download, Share2, Users, Heart, Frown,
  Smile, Meh, AlertCircle, CheckCircle, Star, Quote, FileText, Loader2,
  Calendar, Building, User, MapPin, Target, Lightbulb, TrendingUp,
  Award, Send, Eye, BarChart3, Activity, Clock
} from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Persona {
  id: string
  name: string
  age: string
  occupation: string
  goals: string[]
  painPoints: string[]
  quote: string
  avatar: string
}

interface JourneyPhase {
  id: string
  name: string
  actions: string[]
  touchpoints: string[]
  emotions: 'happy' | 'neutral' | 'frustrated' | 'excited'
  painPoints: string[]
  opportunities: string[]
  customerQuote: string
}

interface JourneyMapPageProps {
  journeyData?: any
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com'

export default function JourneyMapPage({ journeyData: propJourneyData }: JourneyMapPageProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [journeyMap, setJourneyMap] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Load journey data if not provided as props
  useEffect(() => {
    const loadData = async () => {
      if (propJourneyData) {
        console.log('🗺️ JourneyMapPage: Received journey data as props:', propJourneyData)

        // Handle different prop data formats
        let finalJourneyMap = null

        if (propJourneyData.result) {
          // Direct result from job completion
          finalJourneyMap = propJourneyData.result
        } else if (propJourneyData.journey_data) {
          // Journey data from database
          finalJourneyMap = propJourneyData.journey_data
        } else if (propJourneyData.personas || propJourneyData.phases) {
          // Already processed journey data
          finalJourneyMap = propJourneyData
        } else if (propJourneyData.id) {
          // Need to load full data using ID
          await loadJourneyData()
          return
        } else {
          console.warn('⚠️ JourneyMapPage: No valid journey data or ID provided')
          setLoading(false)
          return
        }

        console.log('🗺️ JourneyMapPage: Setting journey map from props:', finalJourneyMap)
        setJourneyMap(finalJourneyMap)
        setLoading(false)
      } else {
        await loadJourneyData()
      }
    }

    loadData()
  }, [propJourneyData])

  const loadJourneyData = async () => {
    if (!id || !token) return

    try {
      // Try the main journey endpoint first
      let response = await fetch(`${API_BASE_URL}/api/journey/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // If that fails, try the info endpoint
      if (!response.ok) {
        console.log('🔄 Main endpoint failed, trying info endpoint...')
        response = await fetch(`${API_BASE_URL}/api/journey/${id}/info`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Journey data loaded:', data)

        // Handle different response formats
        if (data.result) {
          setJourneyMap(data.result)
        } else if (data.journey_data) {
          setJourneyMap(data.journey_data)
        } else {
          setJourneyMap(data)
        }
      } else {
        console.error('❌ Failed to load journey data:', response.status)
      }
    } catch (err) {
      console.error('Error loading journey map data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Mock data as fallback
  const mockJourneyMap = {
    id: id || '1',
    title: 'E-commerce Customer Journey',
    industry: 'E-commerce',
    createdAt: new Date('2024-01-15'),
    personas: [
      {
        id: '1',
        name: 'Sarah Chen',
        age: '28',
        occupation: 'Marketing Manager',
        goals: ['Find quality products quickly', 'Get good value for money', 'Easy returns process'],
        painPoints: ['Too many options', 'Unclear product descriptions', 'Slow checkout'],
        quote: "I want to find what I need quickly without getting overwhelmed by choices.",
        avatar: '👩‍💼'
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        age: '35',
        occupation: 'Software Developer',
        goals: ['Research thoroughly before buying', 'Compare prices', 'Read reviews'],
        painPoints: ['Lack of detailed specs', 'No comparison tools', 'Hidden fees'],
        quote: "I need all the technical details before I make a purchase decision.",
        avatar: '👨‍💻'
      }
    ] as Persona[],
    phases: [
      {
        id: '1',
        name: 'Awareness',
        actions: ['Sees social media ad', 'Searches Google', 'Visits website'],
        touchpoints: ['Social Media', 'Search Engine', 'Website'],
        emotions: 'neutral' as const,
        painPoints: ['Ad not relevant', 'Website loads slowly'],
        opportunities: ['Improve ad targeting', 'Optimize page speed'],
        customerQuote: "I'm curious about this product I saw online."
      },
      {
        id: '2',
        name: 'Consideration',
        actions: ['Browses products', 'Reads reviews', 'Compares options'],
        touchpoints: ['Product Pages', 'Review Section', 'Comparison Tool'],
        emotions: 'frustrated' as const,
        painPoints: ['Too many similar products', 'Confusing navigation'],
        opportunities: ['Add product filters', 'Improve categorization'],
        customerQuote: "There are so many options, I'm not sure which one is right for me."
      },
      {
        id: '3',
        name: 'Purchase',
        actions: ['Adds to cart', 'Enters payment info', 'Completes order'],
        touchpoints: ['Shopping Cart', 'Checkout Page', 'Payment Gateway'],
        emotions: 'happy' as const,
        painPoints: ['Unexpected shipping costs', 'Complex checkout'],
        opportunities: ['Show shipping costs upfront', 'Simplify checkout'],
        customerQuote: "Finally found what I wanted, hope the checkout is smooth."
      },
      {
        id: '4',
        name: 'Delivery',
        actions: ['Receives confirmation', 'Tracks package', 'Receives product'],
        touchpoints: ['Email', 'Tracking Page', 'Delivery Service'],
        emotions: 'excited' as const,
        painPoints: ['Delayed delivery', 'Poor packaging'],
        opportunities: ['Improve delivery estimates', 'Better packaging'],
        customerQuote: "Can't wait to receive my order and try it out!"
      },
      {
        id: '5',
        name: 'Usage',
        actions: ['Unboxes product', 'Sets up/uses product', 'Evaluates quality'],
        touchpoints: ['Product', 'User Manual', 'Support Docs'],
        emotions: 'happy' as const,
        painPoints: ['Complex setup', 'Missing accessories'],
        opportunities: ['Improve onboarding', 'Include all accessories'],
        customerQuote: "This product works great and was worth the purchase."
      },
      {
        id: '6',
        name: 'Advocacy',
        actions: ['Leaves review', 'Recommends to friends', 'Shares on social'],
        touchpoints: ['Review Platform', 'Social Media', 'Word of Mouth'],
        emotions: 'happy' as const,
        painPoints: ['Difficult review process', 'No incentive to share'],
        opportunities: ['Simplify review process', 'Offer referral rewards'],
        customerQuote: "I love this product and want to tell everyone about it!"
      }
    ] as JourneyPhase[]
  }

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return <Smile className="w-6 h-6 text-green-500" />
      case 'excited':
        return <Star className="w-6 h-6 text-yellow-500" />
      case 'neutral':
        return <Meh className="w-6 h-6 text-gray-500" />
      case 'frustrated':
        return <Frown className="w-6 h-6 text-red-500" />
      default:
        return <Meh className="w-6 h-6 text-gray-500" />
    }
  }

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return 'bg-green-100 border-green-300'
      case 'excited':
        return 'bg-yellow-100 border-yellow-300'
      case 'neutral':
        return 'bg-gray-100 border-gray-300'
      case 'frustrated':
        return 'bg-red-100 border-red-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const handleExport = async (format: 'pdf' | 'png' | 'pptx' | 'json') => {
    switch (format) {
      case 'pdf':
        await exportAsPDF()
        break
      case 'json':
        downloadJSONReport(finalDisplayData, finalDisplayData.title)
        break
      default:
        alert(`${format.toUpperCase()} export coming soon!`)
    }
    setShowExportMenu(false)
  }

  const exportAsPDF = async () => {
    try {
      const element = document.getElementById('journey-report')
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${finalDisplayData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_journey_map.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const downloadJSONReport = (data: any, title: string) => {
    const reportData = {
      title: title,
      generatedAt: new Date().toISOString(),
      summary: {
        totalPersonas: data.personas?.length || 0,
        totalPhases: data.phases?.length || 0,
        industry: data.industry,
        createdAt: data.createdAt
      },
      personas: data.personas || [],
      phases: data.phases || []
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_journey_map.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: finalDisplayData.title,
          text: `Check out this customer journey map for ${finalDisplayData.industry}`,
          url: shareUrl
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        alert('Journey map URL copied to clipboard!')
      } else {
        alert(`Share this journey map: ${shareUrl}`)
      }
    } catch (error) {
      console.error('Share failed:', error)
      alert(`Share URL: ${shareUrl}`)
    }
  }

  // Use real data if available, don't fall back to mock data
  const rawData = journeyMap

  // Ensure data has the expected structure
  const finalDisplayData = rawData ? {
    ...rawData,
    personas: rawData.personas || [],
    phases: rawData.phases || [],
    title: rawData.title || 'Untitled Journey',
    industry: rawData.industry || 'Unknown',
    createdAt: rawData.createdAt || new Date().toISOString()
  } : null

  console.log('🗺️ JourneyMapPage: Final display data:', finalDisplayData)

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading journey map...</p>
        </div>
      </div>
    )
  }

  if (!finalDisplayData) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Journey Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load journey data. The journey may not have completed successfully or the data is unavailable.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div id="journey-report" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  {finalDisplayData.title}
                </h1>
                <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{finalDisplayData.industry}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">{finalDisplayData.personas.length} Personas</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{finalDisplayData.phases.length} Phases</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{new Date(finalDisplayData.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/70 hover:bg-white border border-gray-200 rounded-xl transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 font-medium">Share</span>
              </motion.button>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Export</span>
                </motion.button>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 z-50 overflow-hidden"
                  >
                    <div className="py-2">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Export as PDF</div>
                          <div className="text-xs text-gray-500">Professional document format</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Download className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Export as JSON</div>
                          <div className="text-xs text-gray-500">Raw data for analysis</div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Personas</p>
              <p className="text-3xl font-bold text-gray-900">{finalDisplayData.personas.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Journey Phases</p>
              <p className="text-3xl font-bold text-gray-900">{finalDisplayData.phases.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Industry</p>
              <p className="text-3xl font-bold text-gray-900">{finalDisplayData.industry}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p className="text-lg font-bold text-gray-900">{new Date(finalDisplayData.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Personas Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            Customer Personas
            <span className="text-sm font-normal text-gray-500">({finalDisplayData.personas.length})</span>
          </h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {finalDisplayData.personas.map((persona, index) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
              >
                <PersonaCard key={persona.id} persona={persona} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Journey Map */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Journey Map</h2>
        <div className="bg-gray-50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="min-w-max">
              {/* Phase Headers */}
              <div className="flex bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-200">
                {finalDisplayData.phases.map((phase, index) => (
                  <div key={phase.id} className="flex-shrink-0 w-80 sm:w-96 p-4 sm:p-6 text-center border-r border-gray-200 last:border-r-0">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{phase.name}</h3>
                    </div>
                    <div className="flex justify-center">
                      {getEmotionIcon(phase.emotions)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Journey Details */}
              <div className="flex bg-white">
                {finalDisplayData.phases.map((phase) => (
                  <div key={phase.id} className={`flex-shrink-0 w-80 sm:w-96 p-4 sm:p-6 border-r border-gray-200 last:border-r-0`}>
                    <JourneyPhaseDetails phase={phase} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-friendly scroll indicator */}
        <div className="mt-4 text-center text-sm text-gray-500">
          ← Scroll horizontally to view all phases →
        </div>
      </div>

      {/* Journey Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            Customer Journey Map
            <span className="text-sm font-normal text-gray-500">({finalDisplayData.phases.length} phases)</span>
          </h2>
        </div>
        <div className="p-8">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto overflow-y-hidden">
              <div className="min-w-max">
                {/* Phase Headers */}
                <div className="flex bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-b-2 border-white/30">
                  {finalDisplayData.phases.map((phase, index) => (
                    <div key={phase.id} className="flex-shrink-0 w-80 sm:w-96 p-4 sm:p-6 text-center border-r border-white/30 last:border-r-0">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{phase.name}</h3>
                      </div>
                      <div className="flex justify-center">
                        {getEmotionIcon(phase.emotions)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Journey Details */}
                <div className="flex bg-white/50 backdrop-blur-sm">
                  {finalDisplayData.phases.map((phase) => (
                    <div key={phase.id} className={`flex-shrink-0 w-80 sm:w-96 p-4 sm:p-6 border-r border-white/30 last:border-r-0`}>
                      <JourneyPhaseDetails phase={phase} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-friendly scroll indicator */}
          <div className="mt-4 text-center text-sm text-gray-500">
            ← Scroll horizontally to view all phases →
          </div>
        </div>
      </motion.div>

      {/* Key Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-orange-600" />
            </div>
            Key Insights & Recommendations
          </h2>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Main Pain Points
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Complex navigation makes product discovery difficult</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Unexpected costs appear during checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Lack of detailed product information</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Opportunities
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Implement smart product filtering and search</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Show all costs upfront to build trust</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Create referral program to encourage advocacy</span>
                </li>
              </ul>
            </div>
          </div>
          </div>
      </div>
      </div>
      </div>
    </div>
  )
}

function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center text-2xl">
          {persona.avatar}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{persona.name}</h3>
          <p className="text-gray-600">{persona.age} • {persona.occupation}</p>
        </div>
      </div>

      {/* Goals */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" />
          Goals
        </h4>
        <ul className="space-y-2">
          {persona.goals.map((goal, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              {goal}
            </li>
          ))}
        </ul>
      </div>

      {/* Pain Points */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          Pain Points
        </h4>
        <ul className="space-y-2">
          {persona.painPoints.map((pain, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              {pain}
            </li>
          ))}
        </ul>
      </div>

      {/* Quote */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-l-4 border-blue-500">
        <div className="flex items-start gap-3">
          <Quote className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-800 italic leading-relaxed">"{persona.quote}"</p>
        </div>
      </div>
    </div>
  )
}

function JourneyPhaseDetails({ phase }: { phase: JourneyPhase }) {
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      <div>
        <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm uppercase tracking-wider">Actions</h4>
        <ul className="space-y-1">
          {phase.actions.map((action, index) => (
            <li key={index} className="text-xs sm:text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
              <span className="break-words">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm uppercase tracking-wider">Touchpoints</h4>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {phase.touchpoints.map((touchpoint, index) => (
            <span key={index} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 sm:px-3 py-1 rounded-lg text-xs font-medium break-words">
              {touchpoint}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm uppercase tracking-wider">Pain Points</h4>
        <ul className="space-y-1">
          {phase.painPoints.map((pain, index) => (
            <li key={index} className="text-xs sm:text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
              <span className="break-words">{pain}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm uppercase tracking-wider">Opportunities</h4>
        <ul className="space-y-1">
          {phase.opportunities.map((opportunity, index) => (
            <li key={index} className="text-xs sm:text-sm text-green-700 flex items-start gap-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
              <span className="break-words">{opportunity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-xl border-l-4 border-blue-500">
        <div className="flex items-start gap-2">
          <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-gray-800 italic font-medium break-words">"{phase.customerQuote}"</p>
        </div>
      </div>
    </div>
  )
}
